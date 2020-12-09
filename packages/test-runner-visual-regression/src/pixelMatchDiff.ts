import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

import { DiffArgs, DiffResult } from './config';
import { VisualRegressionError } from './VisualRegressionError';

export function pixelMatchDiff({ baselineImage, image, options }: DiffArgs): DiffResult {
  const basePng = PNG.sync.read(baselineImage);
  const png = PNG.sync.read(image);

  if (basePng.width !== png.width || basePng.height !== png.height) {
    throw new VisualRegressionError(
      `Screenshot is not the same width and height as the baseline. ` +
        `Baseline: { width: ${basePng.width}, height: ${basePng.height} }` +
        `Screenshot: { width: ${png.width}, height: ${png.height} }`,
    );
  }

  const width = png.width;
  const height = png.height;

  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(basePng.data, png.data, diff.data, width, height, options);
  const diffPercentage = (numDiffPixels / (width * height)) * 100;

  return {
    diffImage: PNG.sync.write(diff),
    diffPercentage,
  };
}
