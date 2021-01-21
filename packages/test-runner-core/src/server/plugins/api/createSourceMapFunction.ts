import path from 'path';
import convertSourceMap, { SourceMapConverter } from 'convert-source-map';
import { SourceMapConsumer } from 'source-map';

import { request } from './request';
import { StackLocation } from '@web/browser-logs';

const { mapFileCommentRegex } = convertSourceMap;

export type SourceMapFunction = (
  loc: StackLocation,
  userAgent: string,
) => Promise<StackLocation | null>;

interface CachedSourceMap {
  sourceMap?: SourceMapConverter;
  consumer?: SourceMapConsumer;
  loadingPromise?: Promise<void>;
}

function is2xxResponse(status?: number) {
  return typeof status === 'number' && status >= 200 && status < 300;
}

/**
 * Fetches the source maps for a file by retreiving the original source code from the server, and
 * reading the source maps if there are any available.
 */
async function fetchSourceMap(
  protocol: string,
  host: string,
  port: number,
  browserUrl: string,
  userAgent: string,
): Promise<SourceMapConverter | undefined> {
  // fetch the source code used by the browser, using the browser's user agent to
  // account for accurate transformation
  const { response, body } = await request({
    protocol,
    host,
    path: encodeURI(browserUrl),
    port: String(port),
    method: 'GET',
    headers: { 'user-agent': userAgent },
  });

  // we couldn't retreive this file, this could be because it is a generated file
  // from a server plugin which no longer exists
  if (!is2xxResponse(response.statusCode) || !body) {
    return;
  }

  const match = body.match(mapFileCommentRegex);
  if (match && match[0]) {
    const [sourceMapComment] = match;
    const sourceMapUrl = sourceMapComment.replace('//# sourceMappingURL=', '');
    if (sourceMapUrl.startsWith('data')) {
      // this is a data url
      return convertSourceMap.fromSource(body) ?? undefined;
    }

    // this is a source map pointing to another file, fetch it
    const dir = path.posix.dirname(browserUrl.split('?')[0].split('#')[0]);
    const sourcMapPath = path.join(dir, sourceMapUrl);
    const { response: sourceMapResponse, body: sourcMapBody } = await request({
      protocol,
      host,
      path: encodeURI(sourcMapPath),
      port: String(port),
      method: 'GET',
      headers: { 'user-agent': userAgent },
    });

    if (!is2xxResponse(sourceMapResponse.statusCode) || !sourcMapBody) {
      return undefined;
    }

    return convertSourceMap.fromJSON(sourcMapBody) ?? undefined;
  }
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
      let sourceMap: SourceMapConverter;
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
          const result = await fetchSourceMap(protocol, host, port, browserUrl, userAgent);
          cached.sourceMap = result;

          if (!result) {
            return null;
          } else {
            sourceMap = result;
          }
        } finally {
          resolveLoading!();
        }
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
