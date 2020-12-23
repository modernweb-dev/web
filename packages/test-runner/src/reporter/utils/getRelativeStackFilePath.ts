import path from 'path';

import { toFilePath } from './toFilePath';
import { SourceMapFunction } from './createSourceMapFunction';

export async function getRelativeStackFilePath(
  string: string,
  userAgent: string,
  rootDir: string,
  stackLocationRegExp: RegExp,
  sourceMapFunction: SourceMapFunction,
) {
  const match = string.match(stackLocationRegExp);

  if (match) {
    const [, prefix, browserPath, browserParams, line, column, suffix] = match;
    const fullFilePath = browserPath.startsWith(rootDir)
      ? browserPath
      : path.join(rootDir, toFilePath(browserPath));
    const fullBrowserPath = `${browserPath}${browserParams}`;

    const sourceMapResult = await sourceMapFunction(
      fullBrowserPath,
      fullFilePath,
      userAgent,
      Number(line),
      Number(column),
    );

    const final = sourceMapResult ?? { filePath: fullFilePath, line, column };
    const relativeFilePath = path.relative(process.cwd(), final.filePath);
    const location = `${final.line ? `:${final.line}` : ''}${
      final.column ? `:${final.column}` : ''
    }`;
    const pathWithLocation = `${relativeFilePath}${location}`;
    // some browsers like firefox and webkit print an @ symbol in front of the filename
    // this makes it unclickable from the terminal
    const formattedPrefix = prefix.trim() === '@' ? ' @ ' : prefix;

    return {
      startIndex: match.index!,
      replacedString: `${formattedPrefix}${pathWithLocation}${suffix}`,
      relativeFilePath,
      location,
    };
  }

  return null;
}
