import { Context } from 'koa';
import isStream from 'is-stream';
import getStream from 'get-stream';
import { isBinaryFile } from 'isbinaryfile';
import path from 'path';
import { query, isElementNode } from '@parse5/tools';
import { defaultTreeAdapter as adapter, parseFragment, parse, serialize } from 'parse5';
import { Element as ElementAst } from 'parse5/dist/tree-adapters/default';

const OUTSIDE_ROOT_KEY = '/__wds-outside-root__/';

/**
 * Turns a file path into a path suitable for browsers, with a / as seperator.
 * @param {string} filePath
 * @returns {string}
 */
export function toBrowserPath(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

/**
 * Transforms a file system path to a browser URL. For example windows uses `\` on the file system,
 * but it should use `/` in the browser.
 */
export function toFilePath(browserPath: string) {
  return browserPath.split('/').join(path.sep);
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

    return ctx.body as string;
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

  return ctx.body as string;
}

export function isInlineScriptRequest(contextOrUrl: Context | string) {
  const url = typeof contextOrUrl === 'string' ? contextOrUrl : contextOrUrl.url;
  return url.includes(`inline-script-`) && url.includes('source');
}

export function getRequestBrowserPath(url: string) {
  const urlObj = new URL(url, 'http://localhost:8000/');

  let requestPath;
  // inline module requests have the source in a query string
  if (isInlineScriptRequest(url)) {
    requestPath = urlObj.searchParams.get('source')!;
  } else {
    requestPath = urlObj.pathname;
  }

  if (requestPath.endsWith('/')) {
    return `${requestPath}index.html`;
  }
  return requestPath;
}

export function getRequestFilePath(contextOrString: Context | string, rootDir: string): string {
  const url = typeof contextOrString === 'string' ? contextOrString : contextOrString.url;
  const requestPath = getRequestBrowserPath(url);

  if (isOutsideRootDir(requestPath)) {
    const { normalizedPath, newRootDir } = resolvePathOutsideRootDir(requestPath, rootDir);
    const filePath = toFilePath(normalizedPath);
    return path.join(newRootDir, filePath);
  } else {
    const filePath = toFilePath(requestPath);
    return path.join(rootDir, filePath);
  }
}

export function isOutsideRootDir(browserPath: string) {
  return browserPath.startsWith(OUTSIDE_ROOT_KEY);
}

export function resolvePathOutsideRootDir(browserPath: string, rootDir: string) {
  const [, , depthString] = browserPath.split('/');
  const depth = Number(depthString);
  if (depth == null || Number.isNaN(depth)) {
    throw new Error(`Invalid wds-root-dir path: ${path}`);
  }

  const normalizedPath = browserPath.replace(`${OUTSIDE_ROOT_KEY}${depth}`, '');
  const newRootDir = path.resolve(rootDir, `..${path.sep}`.repeat(depth));

  return { normalizedPath, newRootDir };
}

const REGEXP_IS_HTML_DOCUMENT = /^\s*<(!doctype|html|head|body)\b/i;

export function isHtmlFragment(html: string): boolean {
  const htmlWithoutComments = html.replace(/<!--.*?-->/gs, '');
  return !REGEXP_IS_HTML_DOCUMENT.test(htmlWithoutComments);
}

/**
 * Append HTML snippet to the given html document. The document must have either
 * a <body> or <head> element.
 * @param {string} document
 * @param {string} appendedHtml
 */
export function appendToDocument(document: string, appendedHtml: string): string {
  const documentAst = parse(document, { sourceCodeLocationInfo: true });
  let appendNode = query<ElementAst>(
    documentAst,
    node => isElementNode(node) && adapter.getTagName(node) === 'body',
  );
  if (!appendNode || !appendNode.sourceCodeLocation || !appendNode.sourceCodeLocation?.endTag) {
    // there is no body node in the source, use the head instead
    appendNode = query<ElementAst>(
      documentAst,
      node => isElementNode(node) && adapter.getTagName(node) === 'head',
    );
    if (!appendNode || !appendNode.sourceCodeLocation || !appendNode.sourceCodeLocation?.endTag) {
      // the original code did not contain a head or body, so we go with the generated AST
      const body = query<ElementAst>(
        documentAst,
        node => isElementNode(node) && adapter.getTagName(node) === 'body',
      );
      if (!body) throw new Error('parse5 did not generated a body element');
      const fragment = parseFragment(appendedHtml);
      for (const node of adapter.getChildNodes(fragment)) {
        adapter.appendChild(body, node);
      }
      return serialize(documentAst);
    }
  }

  // the original source contained a head or body element, use string manipulation
  // to preserve original code formatting
  const { startOffset } = appendNode.sourceCodeLocation.endTag;
  const start = document.substring(0, startOffset);
  const end = document.substring(startOffset);
  return `${start}${appendedHtml}${end}`;
}
