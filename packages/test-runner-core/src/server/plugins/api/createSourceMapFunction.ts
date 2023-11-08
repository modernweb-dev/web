import path from 'path';
import { SourceMapConverter } from 'convert-source-map';
import { SourceMapConsumer } from 'source-map';

import { fetchSourceMap } from '../../../utils/fetchSourceMap.js';
import { StackLocation } from '@web/browser-logs';

export type SourceMapFunction = (
  loc: StackLocation,
  userAgent: string,
) => Promise<StackLocation | null>;

function resolveRelativeTo(relativeTo: string, filePath: string): string {
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  const dir = path.dirname(relativeTo);
  return path.join(dir, filePath);
}

/**
 * Creates a function that can map file path, line an column based on source maps. It maintains a cache of source maps,
 * so that they are not fetched multiple times.
 * @param protocol
 * @param host
 * @param port
 */
export function createSourceMapFunction(
  protocol: string,
  host: string,
  port: number,
): SourceMapFunction {
  const cachedSourceMaps = new Map<string, Promise<SourceMapConverter | undefined>>();

  return async ({ browserUrl, filePath, line, column }, userAgent) => {
    const cacheKey = `${filePath}${userAgent}`;

    if (!cachedSourceMaps.has(cacheKey)) {
      cachedSourceMaps.set(
        cacheKey,
        fetchSourceMap({
          protocol,
          host,
          port,
          browserUrl,
          userAgent,
        })
          .then(({ sourceMap }) => sourceMap)
          .catch(() => undefined),
      );
    }

    const sourceMap = await cachedSourceMaps.get(cacheKey);
    if (!sourceMap) {
      return null;
    }

    try {
      // if there is no line and column we're looking for just the associated file, for example
      // the test file itself has source maps. if this is a single file source map, we can return
      // that.
      if (typeof line !== 'number' || typeof column !== 'number') {
        const sources = sourceMap.getProperty('sources') as string[] | undefined;
        if (sources && sources.length === 1) {
          return {
            filePath: resolveRelativeTo(filePath, sources[0]),
            browserUrl,
            line: 0,
            column: 0,
          };
        }
        return null;
      }

      // do the actual source mapping
      const consumer: SourceMapConsumer = await new SourceMapConsumer(sourceMap.sourcemap);

      let originalPosition = consumer.originalPositionFor({
        line: line ?? 0,
        column: column ?? 0,
        bias: SourceMapConsumer.GREATEST_LOWER_BOUND,
      });

      if (originalPosition.line == null) {
        originalPosition = consumer.originalPositionFor({
          line: line ?? 0,
          column: column ?? 0,
          bias: SourceMapConsumer.LEAST_UPPER_BOUND,
        });
      }

      consumer.destroy();

      if (originalPosition.line == null) {
        return null;
      }
      if (!originalPosition.source) {
        return null;
      }

      const newFilePath = originalPosition.source.split('/').join(path.sep);
      return {
        filePath: resolveRelativeTo(filePath, newFilePath),
        browserUrl,
        line: originalPosition.line ?? 0,
        column: originalPosition.column ?? 0,
      };
    } catch (error) {
      console.error(`Error while reading source maps for ${filePath}`);
      console.error(error);
      return null;
    }
  };
}
