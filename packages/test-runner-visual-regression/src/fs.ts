import fs from 'fs';
import { promisify } from 'util';

export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const fsAccess = promisify(fs.access);

export async function fileExists(filePath: string) {
  try {
    await fsAccess(filePath);
    return true;
  } catch {
    return false;
  }
}
