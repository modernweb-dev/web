import { Plugin } from 'rollup';
import path from 'path';

import { addRollupInput } from './input/addRollupInput.js';
import { getInputData } from './input/getInputData.js';
import { InputData } from './input/InputData.js';
import { createHTMLOutput } from './output/createHTMLOutput.js';

import {
  GeneratedBundle,
  RollupPluginHTMLOptions,
  ScriptModuleTag,
  TransformHtmlFunction,
} from './RollupPluginHTMLOptions.js';
import { createError, NOOP_IMPORT } from './utils.js';
import { emitAssets } from './output/emitAssets.js';

export interface RollupPluginHtml extends Plugin {
  api: {
    getInputs(): InputData[];
    addHtmlTransformer(transformHtmlFunction: TransformHtmlFunction): void;
    disableDefaultInject(): void;
    addOutput(name: string): Plugin;
  };
}

export function rollupPluginHTML(pluginOptions: RollupPluginHTMLOptions = {}): RollupPluginHtml {
  const multiOutputNames: string[] = [];
  let inputs: InputData[] = [];
  let generatedBundles: GeneratedBundle[] = [];
  let externalTransformHtmlFns: TransformHtmlFunction[] = [];
  let defaultInjectDisabled = false;
  let serviceWorkerPath = '';
  let injectServiceWorker = false;
  let absolutePathPrefix: string;
  let strictCSPInlineScripts = false;

  function reset() {
    inputs = [];
    generatedBundles = [];
    externalTransformHtmlFns = [];
  }

  return {
    name: '@web/rollup-plugin-html',

    options(inputOptions) {
      reset();

      inputs = getInputData(pluginOptions, inputOptions.input);
      const moduleImports: ScriptModuleTag[] = [];

      for (const input of inputs) {
        moduleImports.push(...input.moduleImports);
      }

      if (moduleImports.length === 0) {
        // if there are only pages with pure HTML we need to make sure there is at
        // least some input for rollup
        moduleImports.push(NOOP_IMPORT);
      }

      if (pluginOptions.serviceWorkerPath) {
        serviceWorkerPath = pluginOptions.serviceWorkerPath;
      }
      if (pluginOptions.injectServiceWorker) {
        injectServiceWorker = pluginOptions.injectServiceWorker;
      }
      if (pluginOptions.absolutePathPrefix) {
        absolutePathPrefix = pluginOptions.absolutePathPrefix;
      }
      if (pluginOptions.strictCSPInlineScripts) {
        strictCSPInlineScripts = pluginOptions.strictCSPInlineScripts;
      }
      pluginOptions.bundleAssetsFromCss = !!pluginOptions.bundleAssetsFromCss;

      if (pluginOptions.input == null) {
        // we are reading rollup input, so replace whatever was there
        return { ...inputOptions, input: moduleImports.map(mod => mod.importPath) };
      } else {
        // we need to add modules to existing rollup input
        return addRollupInput(inputOptions, moduleImports);
      }
    },

    /** Watch input files when running in watch mode */
    buildStart() {
      // watch filesf
      for (const input of inputs) {
        if (input.filePath) {
          this.addWatchFile(input.filePath);
        }

        for (const asset of input.assets) {
          this.addWatchFile(asset.filePath);
        }
      }
    },

    /** Notifies rollup that we will be handling these modules */
    resolveId(id) {
      if (id === NOOP_IMPORT.importPath) {
        return NOOP_IMPORT.importPath;
      }

      for (const input of inputs) {
        if (input.inlineModules.find(mod => mod.importPath === id)) {
          return id;
        }
      }
    },

    /** Provide code for modules we are handling */
    load(id) {
      if (id === NOOP_IMPORT.importPath) {
        return 'export default "noop"';
      }

      for (const input of inputs) {
        const foundMod = input.inlineModules.find(mod => mod.importPath === id);
        if (foundMod) {
          return foundMod.code;
        }
      }
    },

    /**
     * Emits output html file if we are doing a single output build.
     * @param {OutputOptions} options
     * @param {OutputBundle} bundle
     */
    async generateBundle(options, bundle) {
      if (multiOutputNames.length !== 0) {
        // we are generating multiple build outputs, which is handled by child plugins
        return;
      }

      if (!options.dir) {
        throw createError('Rollup output options must have a dir option set to emit an HTML file.');
      }
      generatedBundles.push({ name: 'default', options, bundle });

      const emittedAssets = await emitAssets.call(this, inputs, pluginOptions);
      const outputs = await createHTMLOutput({
        outputDir: path.resolve(options.dir),
        inputs,
        emittedAssets,
        generatedBundles,
        externalTransformHtmlFns,
        pluginOptions,
        defaultInjectDisabled,
        serviceWorkerPath,
        injectServiceWorker,
        absolutePathPrefix,
        strictCSPInlineScripts,
      });

      for (const output of outputs) {
        this.emitFile(output);
      }
    },

    api: {
      getInputs() {
        return inputs;
      },

      addHtmlTransformer(transformHtmlFunction: TransformHtmlFunction) {
        externalTransformHtmlFns.push(transformHtmlFunction);
      },

      disableDefaultInject() {
        defaultInjectDisabled = true;
      },

      addOutput(name: string) {
        if (!name || multiOutputNames.includes(name)) {
          throw createError('Each output must have a unique name');
        }

        multiOutputNames.push(name);

        return {
          name: `@web/rollup-plugin-html-multi-output-${multiOutputNames.length}`,

          async generateBundle(options, bundle) {
            if (!options.dir) {
              throw createError(`Output ${name} must have a dir option set.`);
            }

            generatedBundles.push({ name, options, bundle });

            if (generatedBundles.length === multiOutputNames.length) {
              // this is the last build, emit the HTML files
              const outputDirs = new Set(generatedBundles.map(b => b.options.dir));
              if (outputDirs.size !== 1) {
                throw createError(
                  'Unable to emit HTML output. Multiple rollup build outputs have a different output directory set.',
                );
              }

              const emittedAssets = await emitAssets.call(this, inputs, pluginOptions);
              const outputs = await createHTMLOutput({
                outputDir: path.resolve(options.dir),
                inputs,
                emittedAssets,
                generatedBundles,
                externalTransformHtmlFns,
                pluginOptions,
                defaultInjectDisabled,
                serviceWorkerPath,
                injectServiceWorker,
                absolutePathPrefix,
                strictCSPInlineScripts,
              });

              for (const output of outputs) {
                this.emitFile(output);
              }
            }
          },
        } as Plugin;
      },
    },
  };
}
