import path from 'path';

import { VisualRegressionPluginOptions } from './config';
import { VisualRegressionError } from './VisualRegressionError';

function resolveImagePath(baseDir: string, name: string) {
  const finalName = path.extname(name) ? name : `${name}.png`;
  if (path.isAbsolute(finalName)) {
    return finalName;
  }
  return path.join(baseDir, finalName);
}

export interface VisualDiffCommandResult {
  errorMessage?: string;
  diffPercentage: number;
  passed: boolean;
}

export async function visualDiffCommand(
  options: VisualRegressionPluginOptions,
  image: Buffer,
  browser: string,
  name: string,
): Promise<VisualDiffCommandResult> {
  const baseDir = path.resolve(options.baseDir);
  const baselineName = options.getBaselineName({ browser, name });

  const baselineImage = await options.getBaseline({
    filePath: resolveImagePath(baseDir, baselineName),
    baseDir,
    name: baselineName,
  });

  if (options.update) {
    await options.saveBaseline({
      filePath: resolveImagePath(baseDir, baselineName),
      baseDir,
      name: baselineName,
      content: image,
    });
    return { diffPercentage: -1, passed: true };
  }

  const diffName = options.getDiffName({ browser, name });
  const failedName = options.getFailedName({ browser, name });
  const diffFilePath = resolveImagePath(baseDir, diffName);

  const saveFailed = async () => {
    await options.saveFailed({
      filePath: resolveImagePath(baseDir, failedName),
      baseDir,
      name: failedName,
      content: image,
    });
  };

  const saveDiff = async () => {
    await options.saveDiff({
      filePath: diffFilePath,
      baseDir,
      name: diffName,
      content: diffImage,
    });
  };

  if (!baselineImage) {
    await saveFailed();

    return {
      errorMessage: 'There was no baseline image to compare against.',
      diffPercentage: -1,
      passed: false,
    };
  }

  const { diffImage, diffPercentage, error } = await options.getImageDiff({
    name,
    baselineImage,
    image,
    options: options.diffOptions,
  });

  if (error) {
    // The diff has failed, be sure to save the new image.
    await saveFailed();
    await saveDiff();

    throw new VisualRegressionError(error);
  }

  const passed = diffPercentage === 0;

  if (!passed) {
    await saveDiff();
  }

  if (!passed || options.buildCache) {
    await saveFailed();
  }

  return {
    errorMessage: !passed
      ? `Visual diff failed. New screenshot is ${diffPercentage.toFixed(
          2,
        )}% different.\nSee diff for details: ${diffFilePath}`
      : undefined,
    diffPercentage: -1,
    passed,
  };
}
