/* eslint-disable @typescript-eslint/ban-ts-comment */
import path from 'path';
import { Context } from 'koa';
// @ts-ignore
import { parse, ParsedImport } from 'es-module-lexer';
import { queryAll, predicates, getTextContent, setTextContent } from '../dom5';
import { parse as parseHtml, serialize as serializeHtml } from 'parse5';
import { Plugin } from '../Plugin';
import { PluginSyntaxError } from '../logger/PluginSyntaxError';
import { toFilePath } from '../utils';

export type ResolveImport = (source: string) => string | undefined | Promise<string | undefined>;

interface ParsedImport {
  s: number;
  e: number;
  ss: number;
  se: number;
  d: number;
}

const CONCAT_NO_PACKAGE_ERROR =
  'Dynamic import with a concatenated string should start with a valid full package name.';

/**
 * Resolves an import which is a concatenated string (for ex. import('my-package/files/${filename}'))
 *
 * Resolving is done by taking the package name and resolving that, then prefixing the resolves package
 * to the import. This requires the full package name to be present in the string.
 */
async function resolveConcatenatedImport(
  importSpecifier: string,
  resolveImport: ResolveImport,
): Promise<string> {
  let pathToResolve = importSpecifier;
  let pathToAppend = '';

  const parts = importSpecifier.split('/');
  if (importSpecifier.startsWith('@')) {
    if (parts.length < 2) {
      throw new Error(CONCAT_NO_PACKAGE_ERROR);
    }

    pathToResolve = `${parts[0]}/${parts[1]}`;
    pathToAppend = parts.slice(2, parts.length).join('/');
  } else {
    if (parts.length < 1) {
      throw new Error(CONCAT_NO_PACKAGE_ERROR);
    }

    [pathToResolve] = parts;
    pathToAppend = parts.slice(1, parts.length).join('/');
  }

  // TODO: instead of package, we could resolve the bare import and take the first one or two segments
  // this will make it less hardcoded to node resolution
  const packagePath = `${pathToResolve}/package.json`;
  const resolvedPackage = await resolveImport(packagePath);
  if (!resolvedPackage) {
    throw new Error(`Could not resolve conatenated dynamic import, could not find ${packagePath}`);
  }

  const packageDir = resolvedPackage.substring(0, resolvedPackage.length - 'package.json'.length);
  return `${packageDir}${pathToAppend}`;
}

async function maybeResolveImport(
  importSpecifier: string,
  concatenatedString: boolean,
  resolveImport: ResolveImport,
) {
  let resolvedImportFilePath;

  if (concatenatedString) {
    // if this dynamic import is a concatenated string, try our best to resolve. Otherwise leave it untouched and resolve it at runtime.
    try {
      resolvedImportFilePath =
        (await resolveConcatenatedImport(importSpecifier, resolveImport)) ?? importSpecifier;
    } catch (error) {
      return importSpecifier;
    }
  } else {
    resolvedImportFilePath = (await resolveImport(importSpecifier)) ?? importSpecifier;
  }
  return resolvedImportFilePath;
}

export async function transformImports(
  code: string,
  filePath: string,
  resolveImport: ResolveImport,
) {
  let imports: ParsedImport[];
  try {
    [imports] = await parse(code, filePath);
  } catch (error) {
    if (typeof error.idx === 'number') {
      throw new PluginSyntaxError(
        'Syntax error',
        filePath,
        code,
        code.slice(0, error.idx).split('\n').length,
        error.idx - code.lastIndexOf('\n', error.idx - 1),
      );
    }
    throw error;
  }

  let resolvedSource = '';
  let lastIndex = 0;

  for (const imp of imports) {
    const { s: start, e: end, d: dynamicImportIndex } = imp;

    if (dynamicImportIndex === -1) {
      // static import
      const importSpecifier = code.substring(start, end);
      const resolvedImport = await maybeResolveImport(importSpecifier, false, resolveImport);

      resolvedSource += `${code.substring(lastIndex, start)}${resolvedImport}`;
      lastIndex = end;
    } else if (dynamicImportIndex >= 0) {
      // dynamic import
      const dynamicStart = start + 1;
      const dynamicEnd = end - 1;

      const importSpecifier = code.substring(dynamicStart, dynamicEnd);
      const stringSymbol = code[dynamicStart - 1];
      const isStringLiteral = [`\``, "'", '"'].includes(stringSymbol);
      const concatenatedString =
        stringSymbol === `\`` || importSpecifier.includes("'") || importSpecifier.includes('"');
      const resolvedImport = isStringLiteral
        ? await maybeResolveImport(importSpecifier, concatenatedString, resolveImport)
        : importSpecifier;

      resolvedSource += `${code.substring(lastIndex, dynamicStart)}${resolvedImport}`;
      lastIndex = dynamicEnd;
    }
  }

  if (lastIndex < code.length - 1) {
    resolvedSource += `${code.substring(lastIndex, code.length)}`;
  }

  return resolvedSource;
}

async function transformModuleImportsWithPlugins(
  context: Context,
  jsCode: string,
  rootDir: string,
  resolvePlugins: Plugin[],
) {
  const filePath = path.join(rootDir, toFilePath(context.path));

  async function resolveImport(source: string) {
    for (const plugin of resolvePlugins) {
      const resolved = await plugin.resolveImport?.({ source, context });
      if (typeof resolved === 'string') {
        return resolved;
      }

      if (typeof resolved === 'object') {
        return resolved.id;
      }
    }
  }

  async function transformImport(source: string) {
    let resolvedImport = (await resolveImport(source)) ?? source;
    for (const plugin of resolvePlugins) {
      const resolved = await plugin.transformImport?.({ source: resolvedImport, context });
      if (typeof resolved === 'string') {
        resolvedImport = resolved;
      }

      if (typeof resolved === 'object' && typeof resolved.id === 'string') {
        resolvedImport = resolved.id;
      }
    }
    return resolvedImport;
  }

  return transformImports(jsCode, filePath, transformImport);
}

export function transformModuleImportsPlugin(plugins: Plugin[], rootDir: string): Plugin {
  const importPlugins = plugins.filter(pl => !!pl.resolveImport || !!pl.transformImport);

  return {
    name: 'resolve-module-imports',
    async transform(context) {
      if (importPlugins.length === 0) {
        return;
      }

      // resolve served js code
      if (context.response.is('js')) {
        const bodyWithResolvedImports = await transformModuleImportsWithPlugins(
          context,
          context.body,
          rootDir,
          importPlugins,
        );
        return { body: bodyWithResolvedImports };
      }

      // resolve inline scripts
      if (context.response.is('html')) {
        const documentAst = parseHtml(context.body);
        const inlineModuleNodes = queryAll(
          documentAst,
          predicates.AND(
            predicates.hasTagName('script'),
            predicates.hasAttrValue('type', 'module'),
            predicates.NOT(predicates.hasAttr('src')),
          ),
        );

        for (const node of inlineModuleNodes) {
          const code = getTextContent(node);
          const resolvedCode = await transformModuleImportsWithPlugins(
            context,
            code,
            rootDir,
            importPlugins,
          );
          setTextContent(node, resolvedCode);
        }

        return { body: serializeHtml(documentAst) };
      }
    },
  };
}
