import { generateSW, injectManifest } from '../index.mjs';

export default {
  input: 'demo/main.js',
  output: {
    file: 'demo/dist/bundle.js',
    format: 'esm',
  },
  plugins: [
    generateSW({
      swDest: 'demo/dist/generateSW_sw.js',
      globDirectory: 'demo/dist/',
      globIgnores: ['injectManifest_sw.js'],
    },
    function render({ swDest, count, size }) {
      console.log(`\nCustom render! ${swDest}`);
      console.log(`Custom render! The service worker will precache ${count} URLs, totaling ${size}.\n`);
    }),
    injectManifest({
      swSrc: 'demo/injectManifestSwSrc.js',
      swDest: 'demo/dist/injectManifest_sw.js',
      globDirectory: 'demo/dist/',
      globIgnores: ['generateSW_sw.js'],
      mode: 'production',
    }),
  ],
};
