import { Element } from 'parse5';
import { getAttribute } from '@web/parse5-utils';
import crypto from 'crypto';
import { FileType, PolyfillsLoaderConfig } from './types.js';

export const noModuleSupportTest = "!('noModule' in HTMLScriptElement.prototype)";

export const fileTypes: Record<'SCRIPT' | 'MODULE' | 'MODULESHIM' | 'SYSTEMJS', FileType> = {
  SCRIPT: 'script',
  MODULE: 'module',
  MODULESHIM: 'module-shim',
  SYSTEMJS: 'systemjs',
};

export function createContentHash(content: string) {
  return crypto.createHash('md5').update(content).digest('hex');
}

export function cleanImportPath(importPath: string) {
  if (importPath.startsWith('/')) {
    return importPath;
  }

  if (importPath.startsWith('../') || importPath.startsWith('./')) {
    return importPath;
  }

  return `./${importPath}`;
}

export function getScriptFileType(script: Element): FileType {
  return getAttribute(script, 'type') === 'module' ? fileTypes.MODULE : fileTypes.SCRIPT;
}

export function hasFileOfType(cfg: PolyfillsLoaderConfig, type: FileType) {
  return (
    cfg.modern?.files.some(f => f.type === type) ||
    (cfg.legacy && cfg.legacy.some(e => e.files.some(f => f.type === type)))
  );
}
