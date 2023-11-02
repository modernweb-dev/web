import path from 'node:path';

import * as errorStacks from 'errorstacks';

/** @typedef {Pick<errorStacks.StackFrame, 'fileName' | 'line' | 'column'>} RawLocation */

/** @typedef {{
  filePath: string;
  line: number;
  column: number;
}} Location 
*/

/** @typedef {Location & {
  browserUrl: string;
}} StackLocation
*/

/** @typedef {(location: StackLocation) => StackLocation | Promise<StackLocation>} MapStackLocation */
/** @typedef {(url: URL) => string} MapBrowserUrl */

/** @typedef {{
  browserRootDir?: string;
  cwd?: string;
  mapBrowserUrl?: MapBrowserUrl;
  mapStackLocation?: MapStackLocation;
}} ParseStackTraceOptions */

// regexp to match a stack track that is only a full address
const REGEXP_ADDRESS = /^(http(s)?:\/\/.*)(:\d+)(:\d+)$/;
const FILTERED_STACKS = [
  '@web/test-runner',
  '@web/dev-runner',
  '__web-test-runner__',
  '__web-dev-server__',
];

/** @param {unknown} str */
const validString = str => typeof str === 'string' && str !== '';
/** @param {unknown} nr */
const validNumber = nr => typeof nr === 'number' && nr !== -1;

/**
 * @param {errorStacks.StackFrame[]} frames
 */
function filterStackFrames(frames) {
  const withoutNative = frames.filter(f => f.type !== 'native');
  const withoutInternal = withoutNative.filter(
    f => !FILTERED_STACKS.some(p => f.fileName.includes(p)),
  );
  return withoutInternal.length > 0 ? withoutInternal : withoutNative;
}

/**
 * @param {URL} url
 * @param {RawLocation} loc
 * @param {MapBrowserUrl} mapBrowserUrl
 * @param {MapStackLocation} mapStackLocation
 */
async function mapLocation(url, loc, mapBrowserUrl, mapStackLocation) {
  const browserUrl = `${url.pathname}${url.search}${url.hash}`;
  const filePath = mapBrowserUrl(url);
  return mapStackLocation({
    filePath,
    browserUrl,
    line: loc.line,
    column: loc.column,
  });
}

/**
 * @param {string} url
 */
function parseUrl(url) {
  try {
    return new URL(url, 'http://www.example.org/');
  } catch {
    return undefined;
  }
}

/**
 * @param {RawLocation} loc
 * @param {string} cwd
 * @param {MapBrowserUrl} mapBrowserUrl:
 * @param {MapStackLocation} mapStackLocation
 *
 * @returns {Promise<StackLocation>}
 */
async function formatLocation(loc, cwd, mapBrowserUrl, mapStackLocation) {
  const url = parseUrl(loc.fileName);
  /** @type {StackLocation} */
  let mappedLocation;
  if (url) {
    mappedLocation = await mapLocation(url, loc, mapBrowserUrl, mapStackLocation);
  } else {
    // we could not create a browser URL from the stack location, so we don't try to map it
    mappedLocation = { browserUrl: '', filePath: loc.fileName, line: loc.line, column: loc.column };
  }

  const relativeFileName = path.relative(cwd, mappedLocation.filePath);
  return { ...mappedLocation, filePath: relativeFileName };
}
/**
  @param {errorStacks.StackFrame} f
  @param {string} cwd
  @param {MapBrowserUrl} mapBrowserUrl
  @param {MapStackLocation} mapStackLocation
*/
async function formatFrame(f, cwd, mapBrowserUrl, mapStackLocation) {
  if (validString(f.fileName) && validNumber(f.line) && validNumber(f.column)) {
    const location = `${f.fileName}:${f.line}:${f.column}`;
    if (validString(f.name)) {
      return `  at ${f.name} (${location})`;
    }
    return `  at ${location}`;
  }
  const trimmedRaw = f.raw.trim();
  const matchFullAddress = trimmedRaw.match(REGEXP_ADDRESS);

  if (matchFullAddress) {
    // frame is only a full browser path (ex. http://localhost:8000/foo/bar.js:1:2)
    const [, fileName, , line, column] = matchFullAddress;
    const mappedLocation = await formatLocation(
      { fileName, line: Number(line), column: Number(column) },
      cwd,
      mapBrowserUrl,
      mapStackLocation,
    );
    return `  at ${mappedLocation.filePath}:${mappedLocation.line}:${mappedLocation.column}`;
  }

  // fallback to raw
  return `  ${trimmedRaw}`;
}

/**
 * @param {string} errorMsg
 * @param {string} rawStack
 * @param {ParseStackTraceOptions} options
 */
export async function parseStackTrace(errorMsg, rawStack, options = {}) {
  if (rawStack === '' || (rawStack.split('\n').length === 1 && rawStack.includes(errorMsg))) {
    // there is no track trace, or it's only an error message
    return undefined;
  }

  const defaultCwd = process.cwd();
  const {
    browserRootDir = defaultCwd,
    cwd = defaultCwd,
    mapStackLocation = l => l,
    mapBrowserUrl = p => path.join(browserRootDir, p.pathname.split('/').join(path.sep)),
  } = options;

  const allFrames = errorStacks.parseStackTrace(rawStack);
  const frames = filterStackFrames(allFrames);
  if (frames.length === 0) {
    return undefined;
  }

  for (const frame of frames) {
    if (validString(frame.fileName) && validNumber(frame.line) && validNumber(frame.column)) {
      const l = await formatLocation(frame, cwd, mapBrowserUrl, mapStackLocation);
      frame.fileName = l.filePath;
      frame.line = l.line;
      frame.column = l.column;
    }
  }

  const formattedFrames = await Promise.all(
    frames.map(f => formatFrame(f, browserRootDir, mapBrowserUrl, mapStackLocation)),
  );
  return formattedFrames.join('\n');
}
