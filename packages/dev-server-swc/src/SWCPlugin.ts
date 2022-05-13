import {
  Context,
  Plugin,
  PluginSyntaxError,
  Logger,
  DevServerCoreConfig,
  getRequestFilePath,
} from '@web/dev-server-core';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import {
  queryAll,
  predicates,
  getTextContent,
  setTextContent,
} from '@web/dev-server-core/dist/dom5';
import { parse as parseHtml, serialize as serializeHtml } from 'parse5';

import { transform, Options, JscTarget, ParserConfig } from '@swc/core';

export type Loader = 'js' | 'jsx' | 'ts' | 'tsx';

async function fileExists(path: string) {
  try {
    await promisify(fs.access)(path);
    return true;
  } catch {
    return false;
  }
}

export interface SWCConfig {
  loaders: Record<string, Loader>;
  target: JscTarget;
  handledExtensions: string[];
  tsFileExtensions: string[];
  jsxFactory?: string;
  jsxFragment?: string;
}

export class SWCPlugin implements Plugin {
  private config?: DevServerCoreConfig;
  private swcConfig: SWCConfig;
  private transformedHtmlFiles: string[] = [];
  name = 'SWC';

  constructor(swcConfig: SWCConfig) {
    this.swcConfig = swcConfig;
  }

  async serverStart({ config }: { config: DevServerCoreConfig; logger: Logger }) {
    this.config = config;
  }

  resolveMimeType(context: Context) {
    const fileExtension = path.posix.extname(context.path);
    if (this.swcConfig.handledExtensions.includes(fileExtension)) {
      return 'js';
    }
  }

  async resolveImport({ source, context }: { source: string; context: Context }) {
    const fileExtension = path.posix.extname(context.path);
    if (!this.swcConfig.tsFileExtensions.includes(fileExtension)) {
      // only handle typescript files
      return;
    }

    if (!source.endsWith('.js') || !source.startsWith('.')) {
      // only handle relative imports
      return;
    }

    // a TS file imported a .js file relatively, but they might intend to import a .ts file instead
    // check if the .ts file exists, and rewrite it in that case
    const filePath = getRequestFilePath(context.url, this.config!.rootDir);
    const fileDir = path.dirname(filePath);
    const importAsTs = source.substring(0, source.length - 3) + '.ts';
    const importedTsFilePath = path.join(fileDir, importAsTs);
    if (!(await fileExists(importedTsFilePath))) {
      return;
    }
    return importAsTs;
  }

  async transform(context: Context) {
    let loader: Loader;

    if (context.response.is('html')) {
      // we are transforming inline scripts
      loader = 'js';
    } else {
      const fileExtension = path.posix.extname(context.path);
      loader = this.swcConfig.loaders[fileExtension];
    }

    if (!loader) {
      // we are not handling this file
      return;
    }

    const filePath = getRequestFilePath(context.url, this.config!.rootDir);
    if (context.response.is('html')) {
      this.transformedHtmlFiles.push(context.path);
      return this.__transformHtml(context, filePath, loader);
    }

    return this.__transformCode(context.body as string, filePath, loader);
  }

  private async __transformHtml(context: Context, filePath: string, loader: Loader) {
    const documentAst = parseHtml(context.body as string);
    const inlineScripts = queryAll(
      documentAst,
      predicates.AND(
        predicates.hasTagName('script'),
        predicates.NOT(predicates.hasAttr('src')),
        predicates.OR(
          predicates.NOT(predicates.hasAttr('type')),
          predicates.hasAttrValue('type', 'module'),
        ),
      ),
    );

    if (inlineScripts.length === 0) {
      return;
    }

    for (const node of inlineScripts) {
      const code = getTextContent(node);
      const transformedCode = await this.__transformCode(code, filePath, loader);
      setTextContent(node, transformedCode);
    }

    return serializeHtml(documentAst);
  }

  private __getConfig(loader: Loader): Options {
    const typeScriptParser: ParserConfig = { syntax: 'typescript' };
    const ecmaScriptParser: ParserConfig = { syntax: 'ecmascript' };

    let parser: ParserConfig = ecmaScriptParser;

    switch (loader) {
      case 'jsx':
        parser = ecmaScriptParser;
        parser.jsx = true;
        break;
      case 'ts':
        parser = typeScriptParser;
        parser.decorators = true;
        break;
      case 'tsx':
        parser = typeScriptParser;
        parser.tsx = true;
        break;
    }

    const transformOptions: Options = {
      sourceMaps: 'inline',
      jsc: {
        parser,
        transform: {
          react: {
            pragma: this.swcConfig.jsxFactory, // || 'React.createElement',
            pragmaFrag: this.swcConfig.jsxFragment, // 'React.Fragment',
          },
        },
        target: this.swcConfig.target,
        loose: false,
        externalHelpers: false,
        // Requires v1.2.50 or upper and requires target to be es2016 or upper.
        keepClassNames: false,
      },
    };
    return transformOptions;
  }

  private async __transformCode(code: string, filePath: string, loader: Loader): Promise<string> {
    try {
      const transformOptions = this.__getConfig(loader);
      transformOptions.filename = filePath;
      const { code: transformedCode } = await transform(code, transformOptions);

      return transformedCode;
    } catch (e) {
      if (Array.isArray(e.errors)) {
        const msg = e.errors[0];

        if (msg.location) {
          throw new PluginSyntaxError(
            msg.text,
            filePath,
            code,
            msg.location.line,
            msg.location.column,
          );
        }

        throw new Error(msg.text);
      }

      throw e;
    }
  }
}
