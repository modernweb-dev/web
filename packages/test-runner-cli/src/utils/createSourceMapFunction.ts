import { dirname, join } from 'path';
import convertSourceMap, { SourceMapConverter } from 'convert-source-map';
import { SourceMapConsumer } from 'source-map';
import { request } from './request';
import { toFilePath } from './toFilePath';

export interface SourceMappedPath {
  filePath: string;
  line?: number;
  column?: number;
}

export type SourceMapFunction = (
  browserPath: string,
  filePath: string,
  userAgent: string,
  line?: number,
  column?: number,
) => Promise<SourceMappedPath | null>;

interface CachedSourceMap {
  sourceMap: SourceMapConverter;
  consumer?: SourceMapConsumer;
}

async function getSourceMap(
  protocol: string,
  host: string,
  port: number,
  browserPath: string,
  filePath: string,
  userAgent: string,
) {
  // fetch the source code used by the browser, using the browser's user agent to
  // account for accurate transformation
  const { body } = await request({
    protocol,
    host,
    path: `/${encodeURI(browserPath)}`,
    port: String(port),
    method: 'GET',
    headers: { 'user-agent': userAgent },
  });

  // we couldn't retreive this file, this could be because it is a generated file
  // from a serer plugin which no longer exists
  if (!body) return null;

  return (
    // inline source map
    convertSourceMap.fromSource(body) ||
    // external source map
    convertSourceMap.fromMapFileSource(body, dirname(filePath))
  );
}

function resolveRelativeTo(relativeTo: string, path: string) {
  const dir = dirname(relativeTo);
  if (path.startsWith(dir)) {
    return path;
  }
  return join(dir, path);
}

export function createSourceMapFunction(
  protocol: string,
  host: string,
  port: number,
): SourceMapFunction {
  const cachedSourceMaps = new Map<string, CachedSourceMap>();

  return async (browserPath, filePath, userAgent, line, column) => {
    try {
      const cacheKey = `${filePath}${userAgent}`;
      const cached = cachedSourceMaps.get(cacheKey);

      // get the raw source map, from cache or new
      let sourceMap: SourceMapConverter | null;
      if (cached?.sourceMap) {
        sourceMap = cached?.sourceMap;
      } else {
        sourceMap = await getSourceMap(protocol, host, port, browserPath, filePath, userAgent);
        if (!sourceMap) return null;
        cachedSourceMaps.set(cacheKey, { sourceMap: sourceMap });
      }

      // if there is no line and column we're looking for just the associated file, for example
      // the test file itself has soruce maps. if this is a single file source map, we can return
      // that.
      if (typeof line !== 'number' && typeof column !== 'number') {
        const sources = sourceMap.getProperty('sources') as string[] | undefined;
        if (sources && sources.length === 1) {
          return { filePath: resolveRelativeTo(filePath, sources[0]) };
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

      const newFilePath = toFilePath(originalPosition.source!);

      return {
        filePath: resolveRelativeTo(filePath, newFilePath),
        line: originalPosition.line ?? undefined,
        column: originalPosition.column ?? undefined,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  };
}
