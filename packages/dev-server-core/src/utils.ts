import { Context } from 'koa';
import isStream from 'is-stream';
import getStream from 'get-stream';
import { isBinaryFile } from 'isbinaryfile';
import path from 'path';

const REGEXP_TO_BROWSER_PATH = new RegExp(path.sep === '\\' ? '\\\\' : path.sep, 'g');
const REGEXP_TO_FILE_PATH = new RegExp('/', 'g');

/**
 * Turns a file path into a path suitable for browsers, with a / as seperator.
 * @param {string} filePath
 * @returns {string}
 */
export function toBrowserPath(filePath: string) {
  return filePath.replace(REGEXP_TO_BROWSER_PATH, '/');
}

/**
 * Transforms a file system path to a browser URL. For example windows uses `\` on the file system,
 * but it should use `/` in the browser.
 */
export function toFilePath(browserPath: string) {
  return browserPath.replace(REGEXP_TO_FILE_PATH, path.sep);
}

export function getHtmlPath(path: string) {
  return path.endsWith('/') ? `${path}index.html` : path;
}

export class RequestCancelledError extends Error {}

/**
 * Returns the context body as string or buffer, depending on the content type.
 * Response streams can only be read once, the response body is replaced with
 * the stream result.
 */
export async function getResponseBody(ctx: Context): Promise<string | Buffer> {
  let requestCanceled = false;
  ctx.req.on('close', () => {
    requestCanceled = true;
  });

  if (Buffer.isBuffer(ctx.body)) {
    const contentLength = Number(ctx.response.get('content-length'));
    const canStringify = !(await isBinaryFile(ctx.body, contentLength));

    if (requestCanceled) {
      throw new RequestCancelledError();
    }

    if (canStringify) {
      ctx.body = ctx.body.toString();
    }

    return ctx.body;
  }

  if (typeof ctx.body === 'string') {
    return ctx.body;
  }

  if (isStream(ctx.body)) {
    // a stream can only be read once, so after reading it assign
    // the string response to the body so that it can be accessed
    // again later
    try {
      const bodyBuffer = await getStream.buffer(ctx.body);
      ctx.body = bodyBuffer;
      // recursive call will stringify the buffer
      return getResponseBody(ctx);
    } catch (error) {
      if (error instanceof RequestCancelledError) {
        throw error;
      }

      if (requestCanceled) {
        throw new RequestCancelledError();
      }
      throw error;
    }
  }

  return ctx.body;
}

export function isInlineScriptRequest(ctx: Context) {
  return ctx.url.includes(`inline-script-`) && ctx.URL.searchParams.has('source');
}

export function getRequestBrowserPath(context: Context) {
  // inline module requests have the source in a query string
  if (isInlineScriptRequest(context)) {
    return context.URL.searchParams.get('source')!;
  }
  return context.path;
}

export function getRequestFilePath(context: Context, rootDir: string): string {
  const requestPath = getRequestBrowserPath(context);
  const filePath = toFilePath(requestPath);
  return path.join(rootDir, filePath);
}
