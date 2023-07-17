import { mapFileCommentRegex, fromSource, SourceMapConverter, fromJSON } from 'convert-source-map';
import path from 'path';
import { RequestOptions } from 'http';

import { request } from './request.js';

function is2xxResponse(status?: number) {
  return typeof status === 'number' && status >= 200 && status < 300;
}

interface FetchCodeArgs {
  protocol: string;
  host: string;
  port: number;
  browserUrl: string;
  userAgent?: string;
}

interface FetchCodeReturnValue {
  source?: string;
  sourceMap?: SourceMapConverter;
}

async function doFetchSourceMap(
  code: string,
  browserUrl: string,
  reqOpts: RequestOptions,
): Promise<SourceMapConverter | undefined> {
  try {
    const match = code.match(mapFileCommentRegex);
    if (!match || !match[0]) {
      return;
    }

    const [sourceMapComment] = match;
    const sourceMapUrl = sourceMapComment.replace('//# sourceMappingURL=', '');
    if (sourceMapUrl.startsWith('data')) {
      // this is a data url
      return fromSource(code) ?? undefined;
    }

    // this is a source map pointing to another file, fetch it
    const dir = path.posix.dirname(browserUrl.split('?')[0].split('#')[0]);
    const sourcMapPath = path.join(dir, sourceMapUrl);
    const { response: sourceMapResponse, body: sourceMap } = await request({
      ...reqOpts,
      path: encodeURI(sourcMapPath),
    });

    if (!is2xxResponse(sourceMapResponse.statusCode) || !sourceMap) {
      return;
    }

    return fromJSON(sourceMap);
  } catch (error) {
    console.error(`Error retrieving source map for ${browserUrl}`);
    console.error(error);
  }
}

/**
 * Fetches the source maps for a file by retreiving the original source code from the server, and
 * reading the source maps if there are any available.
 */
export async function fetchSourceMap(args: FetchCodeArgs): Promise<FetchCodeReturnValue> {
  const headers: Record<string, string> = args.userAgent ? { 'user-agent': args.userAgent } : {};
  const reqOpts: RequestOptions = {
    protocol: args.protocol,
    host: args.host,
    port: String(args.port),
    method: 'GET',
    headers,
    timeout: 5000,
  };

  // fetch the source code used by the browser, using the browser's user agent to
  // account for accurate transformation
  const { response, body: source } = await request({
    ...reqOpts,
    path: encodeURI(args.browserUrl),
  });

  // we couldn't retreive this file, this could be because it is a generated file
  // from a server plugin which no longer exists
  if (!is2xxResponse(response.statusCode) || !source) {
    return {};
  }

  const sourceMap = await doFetchSourceMap(source, args.browserUrl, reqOpts);
  if (!sourceMap) {
    return { source };
  }
  return { source, sourceMap };
}
