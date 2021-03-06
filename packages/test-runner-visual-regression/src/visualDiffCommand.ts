import path from 'path';

import { VisualRegressionPluginOptions } from './config';

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

  const saveFailed = async () => {
    await options.saveFailed({
      filePath: resolveImagePath(baseDir, failedName),
      baseDir,
      name: failedName,
      content: image,
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

  const { diffImage, diffPercentage } = await options.getImageDiff({
    name,
    baselineImage,
    image,
    options: options.diffOptions,
  });
  const passed = diffPercentage === 0;

  if (!passed) {
    await options.saveDiff({
      filePath: resolveImagePath(baseDir, diffName),
      baseDir,
      name: diffName,
      content: diffImage,
    });
  }

  if (!passed || options.buildCache) {
    await saveFailed();
  }

  return {
    errorMessage: !passed
      ? `Visual diff failed. New screenshot is ${diffPercentage.toFixed(2)} % different.`
      : undefined,
    diffPercentage: -1,
    passed,
  };
}
