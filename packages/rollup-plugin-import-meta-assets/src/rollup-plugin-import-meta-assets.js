// @ts-nocheck
'use strict';

const fs = require('fs');
const path = require('path');
const { createFilter } = require('@rollup/pluginutils');
const { asyncWalk } = require('estree-walker');
const MagicString = require('magic-string');
const {
  dynamicImportToGlob: dynamicURLToGlob,
  VariableDynamicImportError: VariableURLError,
} = require('@rollup/plugin-dynamic-import-vars');

/**
 * Extract the relative path from an AST node representing this kind of expression `new URL('./path/to/asset.ext', import.meta.url)`.
 *
 * @param {import('estree').Node} node - The AST node
 * @returns {string} The relative path
 */
function getRelativeAssetPath(node) {
  // either normal string expression or else it would be Template Literal with a single quasi
  const browserPath = node.arguments[0].value ?? node.arguments[0].quasis[0].value.cooked;
  return browserPath.split('/').join(path.sep);
}

/**
 * Checks if a AST node represents this kind of expression: `new URL('./path/to/asset.ext', import.meta.url)`.
 *
 * @param {import('estree').Node} node - The AST node
 * @returns {undefined | 'static' | 'dynamic'}
 */
function getImportMetaUrlType(node) {
  const isNewURL =
    node.type === 'NewExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'URL' &&
    node.arguments.length === 2 &&
    (node.arguments[0].type === 'Literal' ||
      // Allow template literals, reuses @rollup/plugin-dynamic-import-vars logic
      node.arguments[0].type === 'TemplateLiteral') &&
    typeof getRelativeAssetPath(node) === 'string' &&
    node.arguments[1].type === 'MemberExpression' &&
    node.arguments[1].object.type === 'MetaProperty' &&
    node.arguments[1].property.type === 'Identifier' &&
    node.arguments[1].property.name === 'url';

  if (!isNewURL) {
    return undefined;
  }

  if (node.arguments[0].type === 'TemplateLiteral' && node.arguments[0].expressions.length > 0) {
    return 'dynamic';
  }

  return 'static';
}

/**
 * Detects assets references relative to modules using patterns such as `new URL('./path/to/asset.ext', import.meta.url)`.
 * The assets are added to the rollup pipeline, allowing them to be transformed and hash the filenames.
 * Patterns that represent directories are skipped.
 *
 * @param {object} options
 * @param {string|string[]} [options.include] A picomatch pattern, or array of patterns, which specifies the files in the build the plugin should operate on. By default all files are targeted.
 * @param {string|string[]} [options.exclude] A picomatch pattern, or array of patterns, which specifies the files in the build the plugin should _ignore_. By default no files are ignored.
 * @param {boolean} [options.warnOnError] By default, the plugin quits the build process when it encounters an error. If you set this option to true, it will throw a warning instead and leave the code untouched.
 * @param {function} [options.transform] A function to transform assets.
 * @param {boolean} [options.preserveDynamicStructure] When enabled, emits dynamic assets and rewrites the URL pattern to resolve the original dynamic path relative to the first emitted asset. Requires that the output preserves both filenames (no hashing) and directory structure from the dynamic expression onwards.
 * @return {import('rollup').Plugin} A Rollup Plugin
 */
function importMetaAssets({
  include,
  exclude,
  warnOnError,
  transform,
  preserveDynamicStructure,
} = {}) {
  const filter = createFilter(include, exclude);

  /**
   * Read and optionally transform an asset file.
   * Returns null if the path should be skipped.
   *
   * @param {object} context - Rollup plugin context (for warn/error)
   * @param {string} absoluteAssetPath - Absolute path to the asset
   * @param {number} errorPosition - Position in source for error reporting
   * @returns {Promise<Buffer|string|null>} The asset contents, or null to skip
   */
  async function readAndTransformAsset(context, absoluteAssetPath, errorPosition) {
    try {
      const assetContents = await fs.promises.readFile(absoluteAssetPath);
      if (transform != null) {
        return transform(assetContents, absoluteAssetPath);
      }
      return assetContents;
    } catch (error) {
      // Do not process directories, just skip
      if (error.code !== 'EISDIR') {
        if (warnOnError) {
          context.warn(error, errorPosition);
        } else {
          context.error(error, errorPosition);
        }
      }
      return null;
    }
  }

  return /* @type {import('rollup').Plugin} */ {
    name: 'rollup-plugin-import-meta-assets',

    async transform(code, id) {
      if (!filter(id)) {
        return null;
      }

      let newCode = code;

      // Part 1: resolve dynamic template literal expressions
      const ast1 = this.parse(newCode);
      let ms1;

      let dynamicURLIndex = -1;

      await asyncWalk(ast1, {
        enter: async node => {
          const importMetaUrlType = getImportMetaUrlType(node);

          if (importMetaUrlType !== 'dynamic') {
            return;
          }
          dynamicURLIndex += 1;

          try {
            // see if this is a Template Literal with expressions inside, and generate a glob expression
            const glob = dynamicURLToGlob(
              node.arguments[0],
              newCode.substring(node.start, node.end),
            );

            if (!glob) {
              // this was not a variable dynamic url
              return;
            }

            const { globby } = await import('globby');
            // execute the glob
            const result = await globby(glob, { cwd: path.dirname(id) });
            const paths = result
              .sort()
              .map(r => (r.startsWith('./') || r.startsWith('../') ? r : `./${r}`));

            if (preserveDynamicStructure) {
              // Rewrite the template literal to use relative path from first asset
              // Algorithm:
              // 1. Get static prefix from template
              // 2. Strip static prefix from first matched file to get "variable part"
              // 3. Count directory levels in variable part (excluding filename)
              // 4. Prepend that many "../" to navigate from first asset to siblings
              //
              // Example: `./dynamic-assets/icons-${iconCategory}/${iconName}.svg`
              // - Static prefix: `./dynamic-assets/icons-`
              // - First matched file: `./dynamic-assets/icons-solid/alarm.svg` (defines relative path from the output chunk perspective automatically by rollup)
              // - Variable part: `icons-solid/alarm.svg`
              // - Directory levels: 1 (icons-solid/)
              // - Output: `../icons-${iconCategory}/${iconName}.svg` (defines relative path from the first asset)

              const absoluteScriptDir = path.dirname(id);
              let firstRef = null;

              for (const p of paths) {
                const absoluteAssetPath = path.resolve(absoluteScriptDir, p);
                const assetContents = await readAndTransformAsset(
                  this,
                  absoluteAssetPath,
                  node.arguments[0].start,
                );
                if (assetContents === null) {
                  continue;
                }
                const ref = this.emitFile({
                  type: 'asset',
                  name: path.basename(absoluteAssetPath),
                  originalFileName: absoluteAssetPath,
                  source: assetContents,
                });
                if (firstRef === null) {
                  firstRef = ref;
                }
              }

              if (firstRef !== null && paths.length > 0) {
                ms1 = ms1 || new MagicString(newCode);

                const templateLiteral = node.arguments[0];
                const quasis = templateLiteral.quasis;
                const expressions = templateLiteral.expressions;

                // Get static prefix (everything before first expression)
                const staticPrefix = quasis[0].value.cooked;

                // Split static prefix into directory and filename prefix at last slash
                // e.g. "./dynamic-assets/icons-" -> dir: "./dynamic-assets/", filename prefix: "icons-"
                const lastSlashInPrefix = staticPrefix.lastIndexOf('/');
                const staticDirPrefix =
                  lastSlashInPrefix >= 0 ? staticPrefix.substring(0, lastSlashInPrefix + 1) : '';
                const staticFilenamePrefix =
                  lastSlashInPrefix >= 0
                    ? staticPrefix.substring(lastSlashInPrefix + 1)
                    : staticPrefix;

                // Get first matched file and strip the static directory prefix
                const firstFile = paths[0];
                const variablePart = firstFile.startsWith(staticDirPrefix)
                  ? firstFile.slice(staticDirPrefix.length)
                  : firstFile;

                // Count directory levels in variable part (excluding filename)
                const variableDir = variablePart.substring(0, variablePart.lastIndexOf('/') + 1);
                const dirLevels = variableDir ? variableDir.split('/').filter(Boolean).length : 0;

                // Build prefix: "../" repeated dirLevels times, or "./" if no levels
                // Then append any filename prefix from the original static portion
                const relativePrefix =
                  (dirLevels > 0 ? '../'.repeat(dirLevels) : './') + staticFilenamePrefix;

                // Build the new template literal
                let newTemplateParts = [relativePrefix];
                for (let i = 0; i < expressions.length; i++) {
                  const exprCode = newCode.substring(expressions[i].start, expressions[i].end);
                  newTemplateParts.push('${' + exprCode + '}');
                  newTemplateParts.push(quasis[i + 1].value.raw);
                }
                const newTemplate = '`' + newTemplateParts.join('') + '`';

                ms1.overwrite(templateLiteral.start, templateLiteral.end, newTemplate);

                ms1.overwrite(
                  node.arguments[1].start,
                  node.arguments[1].end,
                  `import.meta.ROLLUP_FILE_URL_${firstRef}`,
                );
              }
            } else {
              // default behavior
              // create magic string if it wasn't created already
              ms1 = ms1 || new MagicString(newCode);
              // unpack variable dynamic url into a function with url statements per file, rollup
              // will turn these into chunks automatically
              ms1.prepend(
                `function __variableDynamicURLRuntime${dynamicURLIndex}__(path) {
  switch (path) {
${paths.map(p => `    case '${p}': return new URL('${p}', import.meta.url);`).join('\n')}
${`    default: return new Promise(function(resolve, reject) {
      (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(
        reject.bind(null, new Error("Unknown variable dynamic new URL statement: " + path))
      );
    })\n`}   }
 }\n\n`,
              );
              // call the runtime function instead of doing a dynamic url, the url specifier will
              // be evaluated at runtime and the correct url will be returned by the injected function
              ms1.overwrite(
                node.start,
                node.start + 7,
                `__variableDynamicURLRuntime${dynamicURLIndex}__`,
              );
            }
          } catch (error) {
            if (error instanceof VariableURLError && warnOnError) {
              this.warn(error);
            } else {
              this.error(error);
            }
          }
        },
      });

      if (ms1) {
        newCode = ms1.toString();
      }

      // Part 2: emit asset files
      const ast2 = this.parse(newCode);
      let ms2;

      await asyncWalk(ast2, {
        enter: async node => {
          const importMetaUrlType = getImportMetaUrlType(node);
          if (!importMetaUrlType) {
            return;
          }

          if (importMetaUrlType === 'static') {
            const absoluteScriptDir = path.dirname(id);
            const relativeAssetPath = getRelativeAssetPath(node);
            const absoluteAssetPath = path.resolve(absoluteScriptDir, relativeAssetPath);
            const assetName = path.basename(absoluteAssetPath);

            const assetContents = await readAndTransformAsset(
              this,
              absoluteAssetPath,
              node.arguments[0].start,
            );
            if (assetContents === null) {
              return;
            }

            const ref = this.emitFile({
              type: 'asset',
              name: assetName,
              originalFileName: absoluteAssetPath,
              source: assetContents,
            });
            ms2 = ms2 || new MagicString(newCode);
            ms2.overwrite(
              node.arguments[0].start,
              node.arguments[1].end,
              `import.meta.ROLLUP_FILE_URL_${ref}`,
            );
          }
        },
      });

      if (ms2) {
        newCode = ms2.toString();
      }

      if (!ms1 && !ms2) {
        return null;
      }

      let map;
      if (ms1 && ms2) {
        const map1 = ms1.generateMap({ hires: true, source: id });
        const map2 = ms2.generateMap({ hires: true, source: id });
        const remapping = (await import('@jridgewell/remapping')).default;
        map = remapping([map2, map1], () => null);
      } else if (ms2) {
        map = ms2.generateMap({ hires: true });
      } else if (ms1) {
        map = ms1.generateMap({ hires: true });
      }

      return {
        code: newCode,
        map,
      };
    },
  };
}

module.exports = { importMetaAssets };
