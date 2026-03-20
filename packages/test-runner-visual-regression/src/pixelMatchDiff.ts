import pixelmatch from 'pixelmatch';
import type { PNG, PNGWithMetadata } from 'pngjs';
import { PNG as PNGClass } from 'pngjs';

import type { DiffArgs, DiffResult } from './config.ts';

export function pixelMatchDiff({ baselineImage, image, options }: DiffArgs): DiffResult {
  let error = '';
  let basePng: PNG | PNGWithMetadata = PNGClass.sync.read(baselineImage);
  let png: PNG | PNGWithMetadata = PNGClass.sync.read(image);
  let { width, height } = png;

  if (basePng.width !== png.width || basePng.height !== png.height) {
    error =
      `Screenshot is not the same width and height as the baseline. ` +
      `Baseline: { width: ${basePng.width}, height: ${basePng.height} } ` +
      `Screenshot: { width: ${png.width}, height: ${png.height} }`;
    width = Math.max(basePng.width, png.width);
    height = Math.max(basePng.height, png.height);
    let oldPng = basePng;
    basePng = new PNGClass({ width, height });
    oldPng.data.copy(basePng.data, 0, 0, oldPng.data.length);
    oldPng = png;
    png = new PNGClass({ width, height });
    oldPng.data.copy(png.data, 0, 0, oldPng.data.length);
  }

  const diff = new PNGClass({ width, height });

  const numDiffPixels = pixelmatch(basePng.data, png.data, diff.data, width, height, options);
  const diffPercentage = (numDiffPixels / (width * height)) * 100;

  return {
    error,
    diffImage: PNGClass.sync.write(diff),
    diffPercentage,
    diffPixels: numDiffPixels,
  };
}
