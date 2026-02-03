import synchronizedPrettier from '@prettier/sync';
import fs from 'fs';
import path from 'path';
import * as prettier from 'prettier';
import { OutputOptions, RollupBuild } from 'rollup';

function collapseWhitespaceAll(str: string) {
  return (
    str &&
    str.replace(/[ \n\r\t\f\xA0]+/g, spaces => {
      return spaces === '\t' ? '\t' : spaces.replace(/(^|\xA0+)[^\xA0]+/g, '$1 ');
    })
  );
}

function format(str: string, parser: prettier.BuiltInParserName) {
  return synchronizedPrettier.format(str, { parser, semi: true, singleQuote: true });
}

function merge(strings: TemplateStringsArray, ...values: string[]): string {
  return strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
}

const extnameToFormatter: Record<string, (str: string) => string> = {
  '.html': (str: string) => format(collapseWhitespaceAll(str), 'html'),
  '.css': (str: string) => format(str, 'css'),
  '.js': (str: string) => format(str, 'typescript'),
  '.json': (str: string) => format(str, 'json'),
  '.svg': (str: string) => format(collapseWhitespaceAll(str), 'html'),
};

function getFormatterFromFilename(name: string): undefined | ((str: string) => string) {
  return extnameToFormatter[path.extname(name)];
}

export const html = (strings: TemplateStringsArray, ...values: string[]) =>
  extnameToFormatter['.html'](merge(strings, ...values));

export const css = (strings: TemplateStringsArray, ...values: string[]) =>
  extnameToFormatter['.css'](merge(strings, ...values));

export const js = (strings: TemplateStringsArray, ...values: string[]) =>
  extnameToFormatter['.js'](merge(strings, ...values));

export const svg = (strings: TemplateStringsArray, ...values: string[]) =>
  extnameToFormatter['.svg'](merge(strings, ...values));

export async function generateTestBundle(build: RollupBuild, outputConfig: OutputOptions) {
  const { output } = await build.generate(outputConfig);
  const chunks: Record<string, string> = {};
  const assets: Record<string, string | Uint8Array> = {};
  const assetsUnformatted: Record<string, string | Uint8Array> = {};

  for (const file of output) {
    const filename = file.fileName;
    const formatter = getFormatterFromFilename(filename);
    if (file.type === 'chunk') {
      chunks[filename] = formatter ? formatter(file.code) : file.code;
    } else if (file.type === 'asset') {
      let code = file.source;
      let codeUnformatted = file.source;
      if (typeof code !== 'string' && filename.endsWith('.css')) {
        code = Buffer.from(code).toString('utf8');
        codeUnformatted = Buffer.from(codeUnformatted).toString('utf8');
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

export function createApp(structure: Record<string, string | Buffer | object>) {
  const timestamp = Date.now();
  const rootDir = path.join(__dirname, `./.tmp/app-${timestamp}`);
  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }
  Object.keys(structure).forEach(filePath => {
    const fullPath = path.join(rootDir, filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(fullPath)) {
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

export function cleanApp() {
  const tmpDir = path.join(__dirname, './.tmp');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true });
  }
}
