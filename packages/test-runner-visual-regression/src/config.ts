import path from 'path';
import mkdirp from 'mkdirp';
import pixelmatch from 'pixelmatch';

import { readFile, writeFile, fileExists } from './fs';
import { pixelMatchDiff } from './pixelMatchDiff';

type PixelMatchParams = Parameters<typeof pixelmatch>;
type PixelMatchOptions = PixelMatchParams[5];

export interface GetNameArgs {
  browser: string;
  name: string;
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
  diffImage: Buffer;
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
   * The base directory to write images to.
   */
  baseDir: string;
  /**
   * Options to use when diffing images.
   */
  diffOptions: PixelMatchOptions;

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
  baseDir: 'screenshots',
  diffOptions: {},

  getBaselineName: ({ browser, name }) => path.join(browser, 'baseline', name),
  getDiffName: ({ browser, name }) => path.join(browser, 'failed', `${name}-diff`),
  getFailedName: ({ browser, name }) => path.join(browser, 'failed', name),

  getBaseline: getImage,
  saveBaseline: saveImage,

  saveDiff: saveImage,
  saveFailed: saveImage,

  getImageDiff: pixelMatchDiff,
};
