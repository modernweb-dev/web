import { Plugin } from 'rollup';
import { addRollupInput } from './input/addRollupInput';
import { getInputHTMLData } from './input/getInputHTMLData';
import { InputHTMLData } from './input/InputHTMLData';
import { createHTMLOutput } from './output/createHTMLOutput';

import {
  GeneratedBundle,
  RollupPluginHTMLOptions,
  TransformFunction,
} from './RollupPluginHTMLOptions';
import { createError, NOOP_IMPORT } from './utils';

export interface RollupPluginHtml extends Plugin {
  api: {
    getInputs(): InputHTMLData[];
    addHtmlTransformer(transformFunction: TransformFunction): void;
    addOutput(name: string): Plugin;
  };
}

export function rollupPluginHTML(pluginOptions: RollupPluginHTMLOptions = {}): RollupPluginHtml {
  const multiOutputNames: string[] = [];
  let inputs: InputHTMLData[] = [];
  let generatedBundles: GeneratedBundle[] = [];
  let externalTransformFns: TransformFunction[] = [];

  function reset() {
    inputs = [];
    generatedBundles = [];
    externalTransformFns = [];
  }

  return {
    name: '@web/rollup-plugin-html',

    options(inputOptions) {
      reset();

      inputs = getInputHTMLData(pluginOptions, inputOptions.input);
      const moduleImports: string[] = [];

      for (const input of inputs) {
        moduleImports.push(...input.moduleImports);
      }

      if (moduleImports.length === 0) {
        // if there are only pages with pure HTML we need to make sure there is at
        // least some input for rollup
        moduleImports.push(NOOP_IMPORT);
      }

      if (pluginOptions.input == null) {
        // we are reading rollup input, so replace whatever was there
        return { ...inputOptions, input: moduleImports };
      } else {
        // we need to add modules to existing rollup input
        return addRollupInput(inputOptions, moduleImports);
      }
    },

    /** Watch input files when running in watch mode */
    buildStart() {
      // watch files
      for (const input of inputs) {
        if (input.filePath) {
          this.addWatchFile(input.filePath);
        }
      }
    },

    /** Notifies rollup that we will be handling these modules */
    resolveId(id) {
      if (id === NOOP_IMPORT) {
        return NOOP_IMPORT;
      }

      for (const input of inputs) {
        if (input.inlineModules.has(id)) {
          return id;
        }
      }
    },

    /** Provide code for modules we are handling */
    load(id) {
      if (id === NOOP_IMPORT) {
        return 'export default "noop"';
      }

      for (const input of inputs) {
        if (input.inlineModules.has(id)) {
          return input.inlineModules.get(id);
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

      const outputs = await createHTMLOutput({
        outputDir: options.dir,
        inputs,
        generatedBundles,
        externalTransformFns,
        pluginOptions,
      });

      for (const output of outputs) {
        this.emitFile(output);
      }
    },

    api: {
      getInputs() {
        return inputs;
      },

      addHtmlTransformer(transformFunction: TransformFunction) {
        externalTransformFns.push(transformFunction);
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

              const outputs = await createHTMLOutput({
                outputDir: options.dir,
                inputs,
                generatedBundles,
                externalTransformFns,
                pluginOptions,
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
