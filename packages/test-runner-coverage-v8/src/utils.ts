import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const REGEXP_TO_FILE_PATH = new RegExp('/', 'g');

export function toFilePath(browserPath: string) {
  return browserPath.replace(REGEXP_TO_FILE_PATH, path.sep);
}

export async function fileExists(file: string) {
  try {
    await promisify(fs.access)(file);
  } catch {
    return false;
  }
  return true;
}
