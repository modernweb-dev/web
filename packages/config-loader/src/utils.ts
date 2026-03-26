import fs from 'fs/promises';

export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch (e) {
    return false;
  }
}
