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
    const [, prefix, browserPath, line, column, suffix] = match;
    const pathWithoutParams = browserPath.split('?')[0].split('#')[0];
    const fullFilePath = path.join(rootDir, toFilePath(pathWithoutParams));

    const sourceMapResult = await sourceMapFunction(
      pathWithoutParams,
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

    return {
      startIndex: match.index!,
      replacedString: `${prefix}${pathWithLocation}${suffix}`,
      relativeFilePath,
      location,
    };
  }

  return null;
}
