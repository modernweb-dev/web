import module from './module-features-a.js';

const featuresB = 'features-b';

window.__importMeta = import.meta.url.indexOf('syntax/module-features.js') > 0;
window.__staticImports = module === 'moduleFeaturesA';
window.__dynamicImports = (async () =>
  (await import('./module-features-b.js')).default === 'moduleFeaturesB')();
window.__dynamicImportsString = (async () =>
  (await import(`./module-${featuresB}.js`)).default === 'moduleFeaturesB')();
