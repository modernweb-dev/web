import {
  Context,
  Plugin,
  PluginSyntaxError,
  Logger,
  DevServerCoreConfig,
  getRequestFilePath,
} from '@web/dev-server-core';
import { startService, Service, Loader, Message, Strict } from 'esbuild';
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

import { getEsbuildTarget } from './getEsbuildTarget';

const exitProcessEvents = ['exit', 'SIGINT'];
const filteredWarnings = ['Unsupported source map comment'];

async function fileExists(path: string) {
  try {
    await promisify(fs.access)(path);
    return true;
  } catch {
    return false;
  }
}

export interface EsbuildConfig {
  loaders: Record<string, Loader>;
  target: string | string[];
  handledExtensions: string[];
  tsFileExtensions: string[];
  jsxFactory?: string;
  jsxFragment?: string;
  strict?: boolean | Strict[];
  define?: { [key: string]: string };
}

export class EsbuildPlugin implements Plugin {
  private config?: DevServerCoreConfig;
  private esbuildConfig: EsbuildConfig;
  private logger?: Logger;
  private service?: Service;
  private transformedHtmlFiles: string[] = [];
  name = 'esbuild';

  constructor(esbuildConfig: EsbuildConfig) {
    this.esbuildConfig = esbuildConfig;
  }

  async serverStart({ config, logger }: { config: DevServerCoreConfig; logger: Logger }) {
    this.config = config;
    this.logger = logger;
    this.service = await startService();

    for (const event of exitProcessEvents) {
      process.on(event, this.onProcessKilled);
    }
  }

  serverStop() {
    this.service?.stop();

    for (const event of exitProcessEvents) {
      process.off(event, this.onProcessKilled);
    }
  }

  onProcessKilled = () => {
    this.service?.stop();
  };

  resolveMimeType(context: Context) {
    const fileExtension = path.posix.extname(context.path);
    if (this.esbuildConfig.handledExtensions.includes(fileExtension)) {
      return 'js';
    }
  }

  async resolveImport({ source, context }: { source: string; context: Context }) {
    const fileExtension = path.posix.extname(context.path);
    if (!this.esbuildConfig.tsFileExtensions.includes(fileExtension)) {
      // only handle typescript files
      return;
    }

    if (!source.endsWith('.js') || !source.startsWith('.')) {
      // only handle relative imports
      return;
    }

    // a TS file imported a .js file relatively, but they might intend to import a .ts file instead
    // check if the .ts file exists, and rewrite it in that case
    const filePath = getRequestFilePath(context, this.config!.rootDir);
    const fileDir = path.dirname(filePath);
    const importAsTs = source.substring(0, source.length - 3) + '.ts';
    const importedTsFilePath = path.join(fileDir, importAsTs);
    if (!(await fileExists(importedTsFilePath))) {
      return;
    }
    return importAsTs;
  }

  transformCacheKey(context: Context) {
    // the transformed files are cached per esbuild transform target
    const target = getEsbuildTarget(this.esbuildConfig.target, context.headers['user-agent']);
    return Array.isArray(target) ? target.join('_') : target;
  }

  async transform(context: Context) {
    let loader: Loader;

    if (context.response.is('html')) {
      // we are transforming inline scripts
      loader = 'js';
    } else {
      const fileExtension = path.posix.extname(context.path);
      loader = this.esbuildConfig.loaders[fileExtension];
    }

    if (!loader) {
      // we are not handling this file
      return;
    }

    const target = getEsbuildTarget(this.esbuildConfig.target, context.headers['user-agent']);
    if (target === 'esnext' && loader === 'js') {
      // no need run esbuild, this happens when compile target is set to auto and the user is on a modern browser
      return;
    }

    const filePath = getRequestFilePath(context, this.config!.rootDir);
    if (context.response.is('html')) {
      this.transformedHtmlFiles.push(context.path);
      return this.__transformHtml(context, filePath, loader, target);
    }

    return this.__transformCode(context.body, filePath, loader, target);
  }

  private async __transformHtml(
    context: Context,
    filePath: string,
    loader: Loader,
    target: string | string[],
  ) {
    const documentAst = parseHtml(context.body);
    const inlineScripts = queryAll(
      documentAst,
      predicates.AND(predicates.hasTagName('script'), predicates.NOT(predicates.hasAttr('src'))),
    );

    if (inlineScripts.length === 0) {
      return;
    }

    for (const node of inlineScripts) {
      const code = getTextContent(node);
      const transformedCode = await this.__transformCode(code, filePath, loader, target);
      setTextContent(node, transformedCode);
    }

    return serializeHtml(documentAst);
  }

  private async __transformCode(
    code: string,
    filePath: string,
    loader: Loader,
    target: string | string[],
  ): Promise<string> {
    try {
      const { js, warnings } = await this.service!.transform(code, {
        sourcefile: filePath,
        sourcemap: 'inline',
        loader,
        target,
        strict:
          // use user defined strict config, otherwise default to strict class fields
          // unless we are transforming TS which does not use strict class fields
          this.esbuildConfig.strict
            ? this.esbuildConfig.strict
            : ['ts', 'tsx'].includes(loader)
            ? []
            : ['class-fields'],
        jsxFactory: this.esbuildConfig.jsxFactory,
        jsxFragment: this.esbuildConfig.jsxFragment,
      });

      if (warnings) {
        const relativePath = path.relative(process.cwd(), filePath);

        for (const warning of warnings) {
          if (!filteredWarnings.some(w => warning.text.includes(w))) {
            this.logger!.warn(
              `[@web/test-runner-esbuild] Warning while transforming ${relativePath}: ${warning.text}`,
            );
          }
        }
      }

      return js;
    } catch (e) {
      if (Array.isArray(e.errors)) {
        const msg = e.errors[0] as Message;

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
