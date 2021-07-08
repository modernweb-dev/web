/* eslint-disable @typescript-eslint/no-empty-function */
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

export interface SaveSnapshotPayload {
  name: string;
  content: string;
}

function isSaveSnapshotPayload(payload: unknown): payload is SaveSnapshotPayload {
  if (!isObject(payload)) throw new Error('You must provide a payload object');
  if (typeof payload.name !== 'string') throw new Error('You must provide a path option');
  if (payload.content !== undefined && typeof payload.content !== 'string')
    throw new Error('You must provide a content option');
  return true;
}

function getSnapshotPath(testFile: string) {
  const testDir = path.dirname(testFile);
  const testFileName = path.basename(testFile);
  const ext = path.extname(testFileName);
  const fileWithoutExt = testFileName.substring(0, testFileName.length - ext.length);
  return path.join(testDir, '__snapshots__', `${fileWithoutExt}.snap.js`);
}

class SnapshotStore {
  private snapshots = new Map<string, string>();
  private readOperations = new Map<string, { promise: Promise<void>; resolve: () => void }>();

  async get(testFilePath: string): Promise<string> {
    const snapshotPath = getSnapshotPath(testFilePath);

    if (this.readOperations.has(snapshotPath)) {
      // something else is already reading, wait for it
      await this.readOperations.get(snapshotPath)?.promise;
    }

    if (this.snapshots.has(testFilePath)) {
      // return from cache
      return this.snapshots.get(testFilePath)!;
    }

    const promiseObj = { resolve: () => {}, promise: Promise.resolve() };
    promiseObj.promise = new Promise<void>(resolve => {
      promiseObj.resolve = resolve;
    });
    this.readOperations.set(testFilePath, promiseObj);

    // store in cache
    const content = (await fileExists(snapshotPath))
      ? await readFile(snapshotPath, 'utf-8')
      : '/* @web/test-runner snapshot v1 */\nexport const snapshots = {};\n\n';
    this.snapshots.set(snapshotPath, content);

    // resolve read promise to let others who are waiting continue
    this.readOperations.get(snapshotPath)?.resolve();
    this.readOperations.delete(snapshotPath);
    return content;
  }

  async saveSnapshot(testFilePath: string, name: string, updatedSnapshot: string) {
    const snapshotPath = getSnapshotPath(testFilePath);
    const nameStr = JSON.stringify(name);
    const startMarker = `snapshots[${nameStr}]`;
    const endMarker = `/* end snapshot ${name} */\n\n`;
    const replacement = updatedSnapshot
      ? `${startMarker} = \n\`${updatedSnapshot}\`;\n${endMarker}`
      : '';

    const content = await this.get(snapshotPath);
    let updatedContent: string;

    const startIndex = content.indexOf(startMarker);
    if (startIndex !== -1) {
      // replace existing snapshot
      const endIndex = content.indexOf(endMarker);
      if (endIndex === -1) {
        throw new Error('Missing snapshot end marker');
      }

      const beforeReplace = content.substring(0, startIndex);
      const afterReplace = content.substring(endIndex + endMarker.length);

      updatedContent = `${beforeReplace}${replacement}${afterReplace}`;
    } else {
      // add new snapshot
      updatedContent = `${content}${replacement}`;
    }

    this.snapshots.set(snapshotPath, updatedContent);
    if (updatedContent.includes('/* end snapshot')) {
      // update or create snapshot
      const fileDir = path.dirname(snapshotPath);
      await mkdirp(fileDir);
      await writeFile(snapshotPath, updatedContent);
    } else {
      // snapshot file is empty, remove it
      if (await fileExists(snapshotPath)) {
        await unlink(snapshotPath);
      }
    }
  }
}

export interface SnapshotPluginConfig {
  updateSnapshots?: boolean;
}

export function snapshotPlugin(config?: SnapshotPluginConfig): TestRunnerPlugin {
  const updateSnapshots = config && config.updateSnapshots;
  const snapshots = new SnapshotStore();

  return {
    name: 'file-commands',

    async executeCommand({ command, payload, session }) {
      if (command === 'get-snapshot-config') {
        return { updateSnapshots };
      }

      if (command === 'get-snapshots') {
        const content = await snapshots.get(session.testFile);
        return { content };
      }

      if (command === 'save-snapshot') {
        if (!isSaveSnapshotPayload(payload)) {
          throw new Error('Invalid save snapshot payload');
        }

        await snapshots.saveSnapshot(session.testFile, payload.name, payload.content);
        return true;
      }
    },
  };
}
