import { TestRunnerPlugin } from '@web/test-runner-core';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import mkdirp from 'mkdirp';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function isObject(payload: unknown): payload is Record<string, unknown> {
  return payload != null && typeof payload === 'object';
}

export interface WriteFilePayload {
  path: string;
  content: string;
  encoding?: BufferEncoding;
}

export interface ReadFilePayload {
  path: string;
  encoding?: BufferEncoding;
}

export interface RemoveFilePayload {
  path: string;
}

function isWriteFilePayload(payload: unknown): payload is WriteFilePayload {
  if (!isObject(payload)) throw new Error('You must provide a payload object');
  if (typeof payload.path !== 'string') throw new Error('You must provide a path option');
  if (typeof payload.content !== 'string') throw new Error('You must provide a content option');
  return true;
}

function isReadFilePayload(payload: unknown): payload is ReadFilePayload {
  if (!isObject(payload)) throw new Error('You must provide a payload object');
  if (typeof payload.path !== 'string') throw new Error('You must provide a path option');
  return true;
}

function isRemoveFilePayload(payload: unknown): payload is RemoveFilePayload {
  if (!isObject(payload)) throw new Error('You must provide a payload object');
  if (typeof payload.path !== 'string') throw new Error('You must provide a path option');
  return true;
}

function joinFilePath(testFile: string, relativePath: string) {
  if (path.isAbsolute(relativePath)) {
    throw new Error('file path must not be an absolute path.');
  }
  const dir = path.dirname(testFile);
  return path.join(dir, relativePath.split('/').join(path.sep));
}

export function filePlugin(): TestRunnerPlugin {
  return {
    name: 'file-commands',

    async executeCommand({ command, payload, session }) {
      if (command === 'write-file') {
        if (!isWriteFilePayload(payload)) {
          throw new Error('You must provide a payload object');
        }

        const filePath = joinFilePath(session.testFile, payload.path);
        const fileDir = path.dirname(filePath);
        await mkdirp(fileDir);
        await writeFile(filePath, payload.content, payload.encoding || 'utf-8');
        return true;
      }

      if (command === 'read-file') {
        if (!isReadFilePayload(payload)) {
          throw new Error('You must provide a payload object');
        }

        const filePath = joinFilePath(session.testFile, payload.path);
        if (await fileExists(filePath)) {
          return readFile(filePath, payload.encoding || 'utf-8');
        } else {
          return undefined;
        }
      }

      if (command === 'remove-file') {
        if (!isRemoveFilePayload(payload)) {
          throw new Error('You must provide a payload object');
        }

        const filePath = joinFilePath(session.testFile, payload.path);
        await unlink(filePath);
        return true;
      }
    },
  };
}
