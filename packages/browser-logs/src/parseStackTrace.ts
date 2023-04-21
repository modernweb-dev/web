import * as errorStacks from 'errorstacks';
import path from 'path';

type RawLocation = Pick<errorStacks.StackFrame, 'fileName' | 'line' | 'column'>;

interface Location {
  filePath: string;
  line: number;
  column: number;
}

export interface StackLocation extends Location {
  browserUrl: string;
}

export type MapStackLocation = (location: StackLocation) => StackLocation | Promise<StackLocation>;
export type MapBrowserUrl = (url: URL) => string;

export interface ParseStackTraceOptions {
  browserRootDir?: string;
  cwd?: string;
  mapBrowserUrl?: MapBrowserUrl;
  mapStackLocation?: MapStackLocation;
}

// regexp to match a stack track that is only a full address
const REGEXP_ADDRESS = /^(http(s)?:\/\/.*)(:\d+)(:\d+)$/;
const FILTERED_STACKS = [
  '@web/test-runner',
  '@web/dev-runner',
  '__web-test-runner__',
  '__web-dev-server__',
];

const validString = (str: unknown) => typeof str === 'string' && str !== '';
const validNumber = (nr: unknown) => typeof nr === 'number' && nr !== -1;

function filterStackFrames(frames: errorStacks.StackFrame[]) {
  const withoutNative = frames.filter(f => f.type !== 'native');
  const withoutInternal = withoutNative.filter(
    f => !FILTERED_STACKS.some(p => f.fileName.includes(p)),
  );
  return withoutInternal.length > 0 ? withoutInternal : withoutNative;
}

async function mapLocation(
  url: URL,
  loc: RawLocation,
  mapBrowserUrl: MapBrowserUrl,
  mapStackLocation: MapStackLocation,
) {
  const browserUrl = `${url.pathname}${url.search}${url.hash}`;
  const filePath = mapBrowserUrl(url);
  return mapStackLocation({
    filePath,
    browserUrl,
    line: loc.line,
    column: loc.column,
  });
}

function parseUrl(url: string) {
  try {
    return new URL(url, 'http://www.example.org/');
  } catch {
    return undefined;
  }
}

async function formatLocation(
  loc: RawLocation,
  cwd: string,
  mapBrowserUrl: MapBrowserUrl,
  mapStackLocation: MapStackLocation,
): Promise<StackLocation> {
  const url = parseUrl(loc.fileName);
  let mappedLocation: StackLocation;
  if (url) {
    mappedLocation = await mapLocation(url, loc, mapBrowserUrl, mapStackLocation);
  } else {
    // we could not create a browser URL from the stack location, so we don't try to map it
    mappedLocation = { browserUrl: '', filePath: loc.fileName, line: loc.line, column: loc.column };
  }

  const relativeFileName = path.relative(cwd, mappedLocation.filePath);
  return { ...mappedLocation, filePath: relativeFileName };
}

async function formatFrame(
  f: errorStacks.StackFrame,
  cwd: string,
  mapBrowserUrl: MapBrowserUrl,
  mapStackLocation: MapStackLocation,
) {
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

export async function parseStackTrace(
  errorMsg: string,
  rawStack: string,
  options: ParseStackTraceOptions = {},
) {
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
