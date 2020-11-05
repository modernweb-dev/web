import { rollup, RollupOptions } from 'rollup';

export async function buildAndWrite(options: RollupOptions) {
  const bundle = await rollup(options);

  if (Array.isArray(options.output)) {
    await bundle.write(options.output[0]);
    await bundle.write(options.output[1]);
  } else if (options.output) {
    await bundle.write(options.output);
  }
}
