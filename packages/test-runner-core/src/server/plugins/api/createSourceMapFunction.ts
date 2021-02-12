import path from 'path';
import { SourceMapConverter } from 'convert-source-map';
import { SourceMapConsumer } from 'source-map';

import { fetchSourceMap } from '../../../utils/fetchSourceMap';
import { StackLocation } from '@web/browser-logs';

export type SourceMapFunction = (
  loc: StackLocation,
  userAgent: string,
) => Promise<StackLocation | null>;

interface CachedSourceMap {
  sourceMap?: SourceMapConverter;
  consumer?: SourceMapConsumer;
  loadingPromise?: Promise<void>;
}

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
  const cachedSourceMaps = new Map<string, CachedSourceMap | null>();

  return async ({ browserUrl, filePath, line, column }, userAgent) => {
    try {
      const cacheKey = `${filePath}${userAgent}`;
      let cached = cachedSourceMaps.get(cacheKey);
      if (cached) {
        if (cached.loadingPromise) {
          // a request for this source map is already being done in parallel, wait for it to finish
          await cached.loadingPromise;
        }

        if (!cached.sourceMap) {
          // we know there is no source map for this file
          return null;
        }
      } else {
        cached = {};
      }
      cachedSourceMaps.set(cacheKey, cached);

      // get the raw source map, from cache or new
      let sourceMap: SourceMapConverter | undefined;
      if (cached.sourceMap) {
        sourceMap = cached?.sourceMap;
      } else {
        // fetch source map, maintain a loading boolean for parallel calls to wait before resolving
        let resolveLoading: () => void;
        const loadingPromise = new Promise<void>(resolve => {
          resolveLoading = resolve;
        });
        cached.loadingPromise = loadingPromise;

        try {
          const result = await fetchSourceMap({
            protocol,
            host,
            port,
            browserUrl,
            userAgent,
          });
          sourceMap = result.sourceMap;
          cached.sourceMap = sourceMap;
        } finally {
          resolveLoading!();
        }
      }
      if (!sourceMap) {
        return null;
      }

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
      let consumer: SourceMapConsumer;
      if (cached?.consumer) {
        consumer = cached.consumer;
      } else {
        consumer = await new SourceMapConsumer(sourceMap.sourcemap);
        cachedSourceMaps.get(cacheKey)!.consumer = consumer;
      }

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
