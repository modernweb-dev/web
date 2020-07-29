/* eslint-disable no-undef */
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const production = process.env.ROLLUP_PRODUCTION_BUILD === 'true';

export default input => ({
  input,
  output: {
    dir: './dist',
    sourcemap: true,
    format: 'es',
  },
  plugins: [
    nodeResolve(),
    typescript(),
    production &&
      terser({
        output: {
          comments: false,
        },
      }),
  ].filter(_ => _),
});
