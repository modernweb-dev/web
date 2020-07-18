import { getRelativeStackFilePath } from './getRelativeStackFilePath';
import { SourceMapFunction } from './createSourceMapFunction';

export async function replaceRelativeStackFilePath(
  string: string,
  userAgent: string,
  rootDir: string,
  stackLocationRegExp: RegExp,
  sourceMapFunction: SourceMapFunction,
) {
  const result = await getRelativeStackFilePath(
    string,
    userAgent,
    rootDir,
    stackLocationRegExp,
    sourceMapFunction,
  );
  if (!result) {
    return string;
  }

  return `${string.substring(0, result.startIndex)}${result.replacedString}`;
}
