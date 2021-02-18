import {
  PolyfillsLoaderConfig,
  File,
  GeneratedFile,
  PolyfillFile,
  PolyfillsLoader,
  LegacyEntrypoint,
} from './types';

import { transformAsync } from '@babel/core';
import Terser from 'terser';
import { fileTypes, hasFileOfType, cleanImportPath } from './utils';
import { createPolyfillsData } from './createPolyfillsData';
import path from 'path';

/**
 * Function which loads a script dynamically, returning a thenable (object with then function)
 * because Promise might not be loaded yet
 */
const loadScriptFunction = `
  function loadScript(src, type) {
    return new Promise(function (resolve) {
      var script = document.createElement('script');
      function onLoaded() {
        if (script.parentElement) {
          script.parentElement.removeChild(script);
        }
        resolve();
      }
      script.src = src;
      script.onload = onLoaded;
      script.onerror = function () {
        console.error('[polyfills-loader] failed to load: ' + src + ' check the network tab for HTTP status.');
        onLoaded();
      }
      if (type) script.type = type;
      document.head.appendChild(script);
    });
  }
`;

/**
 * Returns the loadScriptFunction if a script will be loaded for this config.
 */
function createLoadScriptCode(cfg: PolyfillsLoaderConfig, polyfills: PolyfillFile[]) {
  const { MODULE, SCRIPT } = fileTypes;
  if (
    (polyfills && polyfills.length > 0) ||
    [SCRIPT, MODULE].some(type => hasFileOfType(cfg, type))
  ) {
    return loadScriptFunction;
  }

  return '';
}

/**
 * Returns a js statement which loads the given resource in the browser.
 */
function createLoadFile(file: File) {
  const resourePath = cleanImportPath(file.path);

  switch (file.type) {
    case fileTypes.SCRIPT:
      return `loadScript('${resourePath}')`;
    case fileTypes.MODULE:
      return `loadScript('${resourePath}', 'module')`;
    case fileTypes.SYSTEMJS:
      return `System.import('${resourePath}')`;
    default:
      throw new Error(`Unknown resource type: ${file.type}`);
  }
}

/**
 * Creates a statement which loads the given resources in the browser sequentually.
 */
function createLoadFiles(files: File[]) {
  if (files.length === 1) {
    return createLoadFile(files[0]);
  }

  return `[
    ${files.map(r => `function() { return ${createLoadFile(r)} }`)}
  ].reduce(function (a, c) {
    return a.then(c);
  }, Promise.resolve())`;
}

/**
 * Creates js code which loads the correct resources, uses runtime feature detection
 * of legacy resources are configured to load the appropriate resources.
 */
function createLoadFilesFunction(cfg: PolyfillsLoaderConfig) {
  const loadResources = cfg.modern && cfg.modern.files ? createLoadFiles(cfg.modern.files) : '';
  if (!cfg.legacy || cfg.legacy.length === 0) {
    return loadResources;
  }

  function reduceFn(all: string, current: LegacyEntrypoint, i: number) {
    return `${all}${i !== 0 ? ' else ' : ''}if (${current.test}) {
      ${createLoadFiles(current.files)}
    }`;
  }
  const loadLegacyResources = cfg.legacy.reduce(reduceFn, '');

  return `${loadLegacyResources} else {
      ${loadResources}
    }`;
}

/**
 * Creates js code which waits for polyfills if applicable, and executes
 * the code which loads entrypoints.
 */
function createLoadFilesCode(cfg: PolyfillsLoaderConfig, polyfills: PolyfillFile[]) {
  const loadFilesFunction = createLoadFilesFunction(cfg);

  // create a separate loadFiles to be run after polyfills
  if (polyfills && polyfills.length > 0) {
    return `
  function loadFiles() {
    ${loadFilesFunction}
  }

  if (polyfills.length) {
    Promise.all(polyfills).then(loadFiles);
  } else {
    loadFiles();
  }`;
  }

  // there are no polyfills, load entries straight away
  return `${loadFilesFunction}`;
}

/**
 * Returns the relative path to a polyfill (in posix path format suitable for
 * a relative URL) given the plugin configuation
 */
function relativePolyfillPath(polyfillPath: string, cfg: PolyfillsLoaderConfig) {
  const relativePath = path.join(cfg.relativePathToPolyfills || './', polyfillPath);
  return relativePath.split(path.sep).join(path.posix.sep);
}

/**
 * Creates code which loads the configured polyfills
 */
function createPolyfillsLoaderCode(
  cfg: PolyfillsLoaderConfig,
  polyfills: PolyfillFile[],
): { loadPolyfillsCode: string; generatedFiles: GeneratedFile[] } {
  if (!polyfills || polyfills.length === 0) {
    return { loadPolyfillsCode: '', generatedFiles: [] };
  }
  const generatedFiles: GeneratedFile[] = [];
  let loadPolyfillsCode = '  var polyfills = [];';

  polyfills.forEach(polyfill => {
    let loadScript = `loadScript('./${relativePolyfillPath(polyfill.path, cfg)}')`;
    if (polyfill.initializer) {
      loadScript += `.then(function () { ${polyfill.initializer} })`;
    }
    const loadPolyfillCode = `polyfills.push(${loadScript});`;

    if (polyfill.test) {
      loadPolyfillsCode += `if (${polyfill.test}) { ${loadPolyfillCode} }`;
    } else {
      loadPolyfillsCode += `${loadPolyfillCode}`;
    }

    generatedFiles.push({
      type: polyfill.type,
      path: polyfill.path,
      content: polyfill.content,
    });
  });

  return { loadPolyfillsCode, generatedFiles };
}

/**
 * Creates a loader script that executes immediately, loading the configured
 * polyfills and resources (app entrypoints, scripts etc.).
 */
export async function createPolyfillsLoader(
  cfg: PolyfillsLoaderConfig,
): Promise<PolyfillsLoader | null> {
  let polyfillFiles = await createPolyfillsData(cfg);
  const coreJs = polyfillFiles.find(pf => pf.name === 'core-js');
  polyfillFiles = polyfillFiles.filter(pf => pf !== coreJs);
  const { loadPolyfillsCode, generatedFiles } = createPolyfillsLoaderCode(cfg, polyfillFiles);

  let code = `
    ${createLoadScriptCode(cfg, polyfillFiles)}
    ${loadPolyfillsCode}
    ${createLoadFilesCode(cfg, polyfillFiles)}
  `;

  if (coreJs) {
    generatedFiles.push({
      type: fileTypes.SCRIPT,
      path: coreJs.path,
      content: coreJs.content,
    });

    // if core-js should be polyfilled, load it first and then the rest because most
    // polyfills rely on things like Promise to be already loaded
    code = `(function () {
      function polyfillsLoader() {
        ${code}
      }

      if (${coreJs.test}) {
        var s = document.createElement('script');
        function onLoaded() {
          document.head.removeChild(s);
          polyfillsLoader();
        }
        s.src = "./${relativePolyfillPath(coreJs.path, cfg)}";
        s.onload = onLoaded;
        s.onerror = function () {
          console.error('[polyfills-loader] failed to load: ' + s.src + ' check the network tab for HTTP status.');
          onLoaded();
        }
        document.head.appendChild(s);
      } else {
        polyfillsLoader();
      }
     })();`;
  } else {
    code = `(function () { ${code} })();`;
  }

  if (cfg.minify) {
    const output = await Terser.minify(code);
    if (!output || !output.code) {
      throw new Error('Could not minify loader.');
    }
    ({ code } = output);
  } else {
    const output = await transformAsync(code, { babelrc: false, configFile: false });
    if (!output || !output.code) {
      throw new Error('Could not prettify loader.');
    }
    ({ code } = output);
  }

  return { code, polyfillFiles: generatedFiles };
}
