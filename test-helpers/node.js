const synchronizedPrettier = require('@prettier/sync');
const { green, red, yellow } = require('nanocolors');
const fs = require('fs');
const path = require('path');

const timeout = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchText(url, init) {
  const response = await fetch(url, init);
  if (response.status !== 200) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function assertIncludes(text, expected) {
  if (!text.includes(expected)) {
    throw new Error(red(`Expected "${yellow(expected)}" in string: \n\n${green(text)}`));
  }
}

function assertNotIncludes(text, expected) {
  if (text.includes(expected)) {
    throw new Error(`Did not expect "${expected}" in string: \n\n${text}`);
  }
}

function collapseWhitespaceAll(str) {
  return (
    str &&
    str.replace(/[ \n\r\t\f\xA0]+/g, spaces => {
      return spaces === '\t' ? '\t' : spaces.replace(/(^|\xA0+)[^\xA0]+/g, '$1 ');
    })
  );
}

function format(str, parser) {
  return synchronizedPrettier.format(str, { parser, semi: true, singleQuote: true });
}

function merge(strings, ...values) {
  return strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
}

const extnameToFormatter = {
  '.html': str => format(collapseWhitespaceAll(str), 'html'),
  '.css': str => format(str, 'css'),
  '.js': str => format(str, 'typescript'),
  '.json': str => format(str, 'json'),
  '.svg': str => format(collapseWhitespaceAll(str), 'html'),
};

function getFormatterFromFilename(name) {
  return extnameToFormatter[path.extname(name)];
}

const html = (strings, ...values) => extnameToFormatter['.html'](merge(strings, ...values));

const css = (strings, ...values) => extnameToFormatter['.css'](merge(strings, ...values));

const js = (strings, ...values) => extnameToFormatter['.js'](merge(strings, ...values));

const svg = (strings, ...values) => extnameToFormatter['.svg'](merge(strings, ...values));

async function generateTestBundle(build, outputConfig) {
  const { output } = await build.generate(outputConfig);
  const chunks = {};
  const assets = {};
  const assetsUnformatted = {};

  for (const file of output) {
    const filename = file.fileName;
    const formatter = getFormatterFromFilename(filename);
    if (file.type === 'chunk') {
      chunks[filename] = formatter ? formatter(file.code) : file.code;
    } else if (file.type === 'asset') {
      let code = file.source;
      let codeUnformatted = file.source;
      if (Buffer.isBuffer(code)) {
        code = code.toString('utf8');
        codeUnformatted = codeUnformatted.toString('utf8');
      }
      if (typeof code === 'string' && formatter) {
        code = formatter(code);
      }
      assets[filename] = code;
      assetsUnformatted[filename] = codeUnformatted;
    }
  }

  return { output, chunks, assets, assetsUnformatted };
}

let tmpDirs = [];

function createApp(structure) {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const rootDir = path.join(process.cwd(), `.tmp/app-${timestamp}-${randomId}`);
  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }
  tmpDirs.push(rootDir);

  Object.keys(structure).forEach(filePath => {
    const fullPath = path.join(rootDir, filePath);
    const isDir = fullPath.endsWith(path.sep);
    const dir = isDir ? fullPath.slice(0, -1) : path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!isDir && !fs.existsSync(fullPath)) {
      const content = structure[filePath];
      const contentForWrite =
        typeof content === 'object' && !(content instanceof Buffer)
          ? JSON.stringify(content)
          : content;
      fs.writeFileSync(fullPath, contentForWrite);
    }
  });
  return rootDir;
}

function cleanApp() {
  for (const dir of tmpDirs) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
  }
  tmpDirs = [];
}

module.exports = {
  timeout,
  fetchText,
  assertIncludes,
  assertNotIncludes,
  html,
  css,
  js,
  svg,
  generateTestBundle,
  createApp,
  cleanApp,
};
