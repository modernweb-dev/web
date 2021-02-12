/* eslint-disable no-undef */
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default input => ({
  input,
  output: {
    dir: './dist',
    sourcemap: false,
    format: 'es',
  },
  plugins: [
    nodeResolve(),
    typescript({
      composite: false,
      sourceMap: false,
    }),
    terser({
      output: {
        comments: false,
      },
    }),
  ],
});
