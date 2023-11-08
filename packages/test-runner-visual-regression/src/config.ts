import path from 'path';
import mkdirp from 'mkdirp';
import pixelmatch from 'pixelmatch';

import { readFile, writeFile, fileExists } from './fs.js';
import { pixelMatchDiff } from './pixelMatchDiff.js';

type PixelMatchParams = Parameters<typeof pixelmatch>;
type PixelMatchOptions = PixelMatchParams[5];

export interface GetNameArgs {
  browser: string;
  name: string;
  testFile: string;
}

export interface ImageArgs {
  filePath: string;
  baseDir: string;
  name: string;
}

export interface SaveImageArgs extends ImageArgs {
  content: Buffer;
}

export type OptionalImage = Buffer | undefined | Promise<Buffer | undefined>;

export interface DiffResult {
  diffPercentage: number;
  diffPixels: number;
  diffImage: Buffer;
  error: string;
}

export interface DiffArgs {
  name: string;
  baselineImage: Buffer;
  image: Buffer;
  options: PixelMatchOptions;
}

export interface VisualRegressionPluginOptions {
  /**
   * Whether to update the baseline image instead of comparing
   * the image with the current baseline.
   */
  update: boolean;
  /**
   * Whether to build a new cache separate from the baseline
   * of the new/failed images. Useful for removed and/or
   * purposely updated tests.
   */
  buildCache: boolean;
  /**
   * The base directory to write images to.
   */
  baseDir: string;
  /**
   * Options to use when diffing images.
   */
  diffOptions: PixelMatchOptions;

  /**
   * The threshold after which a diff is considered a failure, depending on the failureThresholdType.
   * For `failureThresholdType` of "percentage", this should be a number between 0-100.
   * For `failureThresholdType` of "pixels", this should be a positive integer.
   */
  failureThreshold: number;

  /**
   * The type of threshold that would trigger a failure.
   */
  failureThresholdType: 'percent' | 'pixel';

  /**
   * Returns the name of the baseline image file. The name
   * is a path relative to the baseDir
   */
  getBaselineName: (args: GetNameArgs) => string;
  /**
   * Returns the name of the image file representing the difference
   * between the baseline and the new image. The name is a path
   * relative to the baseDir
   */
  getDiffName: (args: GetNameArgs) => string;
  /**
   * Returns the name of the failed image file. The name is a path
   * relative to the baseDir
   */
  getFailedName: (args: GetNameArgs) => string;

  /**
   * Returns the baseline image.
   */
  getBaseline: (args: ImageArgs) => OptionalImage;
  /**
   * Saves the baseline image.
   */
  saveBaseline: (args: SaveImageArgs) => void | Promise<void>;

  /**
   * Saves the image representing the difference between the
   * baseline and the new image.
   */
  saveDiff: (args: SaveImageArgs) => void | Promise<void>;
  /**
   * Saves the failed image file.
   */
  saveFailed: (args: SaveImageArgs) => void | Promise<void>;

  /**
   * Gets the difference between two images.
   */
  getImageDiff: (args: DiffArgs) => DiffResult | Promise<DiffResult>;
}

async function getImage({ filePath }: ImageArgs) {
  if (await fileExists(filePath)) {
    return readFile(filePath);
  }
}

async function saveImage({ filePath, content }: SaveImageArgs) {
  await mkdirp(path.dirname(filePath));
  await writeFile(filePath, content);
}

export const defaultOptions: VisualRegressionPluginOptions = {
  update: false,
  buildCache: false,
  baseDir: 'screenshots',
  diffOptions: {},

  failureThreshold: 0,
  failureThresholdType: 'percent',

  getBaselineName: ({ browser, name }) => path.join(browser, 'baseline', name),
  getDiffName: ({ browser, name }) => path.join(browser, 'failed', `${name}-diff`),
  getFailedName: ({ browser, name }) => path.join(browser, 'failed', name),

  getBaseline: getImage,
  saveBaseline: saveImage,

  saveDiff: saveImage,
  saveFailed: saveImage,

  getImageDiff: pixelMatchDiff,
};
