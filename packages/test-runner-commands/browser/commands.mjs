/* eslint-env browser, es2020 */
const PARAM_SESSION_ID = 'wtr-session-id';

const sessionId = new URL(window.location.href).searchParams.get(PARAM_SESSION_ID);

function isObject(payload) {
  return payload != null && typeof payload === 'object';
}

export async function executeServerCommand(command, payload, pluginName) {
  if (typeof sessionId !== 'string') {
    throw new Error(
      'Unable to execute server commands in a browser not controlled by the test runner. ' +
        'Use the debug option from the watch menu to debug in a controlled browser.',
    );
  }

  let sendMessageWaitForResponse;
  try {
    const webSocketModule = await import('/__web-dev-server__web-socket.js');
    ({ sendMessageWaitForResponse } = webSocketModule);
  } catch (error) {
    throw new Error(
      'Could not setup web socket connection. Are you executing this test through Web Test Runner?',
    );
  }

  try {
    const response = await sendMessageWaitForResponse({
      type: 'wtr-command',
      sessionId,
      command,
      payload,
    });

    if (!response.executed) {
      let msg;
      if (pluginName) {
        msg = `Unknown command ${command}. Add the ${pluginName} to your config.`;
      } else {
        msg = `Unknown command ${command}. Did you install a plugin to handle this command?`;
      }
      throw new Error(msg);
    }

    return response.result;
  } catch (error) {
    throw new Error(
      `Error while executing command ${command}${
        payload ? ` with payload ${JSON.stringify(payload)}` : ''
      }: ${error.message}`,
    );
  }
}

export function setViewport(viewport) {
  return executeServerCommand('set-viewport', viewport);
}

export function emulateMedia(media) {
  return executeServerCommand('emulate-media', media);
}

export function setUserAgent(options) {
  return executeServerCommand('set-user-agent', options);
}

export function sendKeys(options) {
  return executeServerCommand('send-keys', options);
}

export function a11ySnapshot(options) {
  return executeServerCommand('a11y-snapshot', options);
}

export function writeFile(options) {
  return executeServerCommand('write-file', options, 'filePlugin from @web/test-runner-commands');
}

export function readFile(options) {
  return executeServerCommand('read-file', options, 'filePlugin from @web/test-runner-commands');
}

export function removeFile(options) {
  return executeServerCommand('remove-file', options, 'filePlugin from @web/test-runner-commands');
}

export function findAccessibilityNode(node, test) {
  if (test(node)) return node;
  for (const child of node.children || []) {
    const foundNode = findAccessibilityNode(child, test);
    if (foundNode) {
      return foundNode;
    }
  }
  return null;
}

let snapshotConfig;
let cachedSnapshots;

export async function getSnapshotConfig() {
  if (!snapshotConfig) {
    snapshotConfig = await executeServerCommand(
      'get-snapshot-config',
      undefined,
      'snapshotPlugin from @web/test-runner-commands',
    );
  }

  return snapshotConfig;
}

/**
 * This regexp is used to capture the snapshots contents.
 *
 * snapshots\[[^\]]+] = (\n)? - snapshot definition. Sometimes the initial content backtick is placed in the next line
 * (?<content>`[^`]+`) - capture the snapshot content, which is included between backticks "`"
 * /gm - global and multiline
 * @type {RegExp}
 */
const ESCAPE_REGEX = /snapshots\[[^\]]+] = (\n)?(?<content>`[^`]*`)/gm;

const escapeContent = content => {
  [...content.matchAll(ESCAPE_REGEX)].forEach(({ groups: { content: itemContent } }) => {
    content = content.replaceAll(itemContent, encodeURIComponent(itemContent));
  });

  return content;
};

export async function getSnapshots({ cache = true } = {}) {
  if (cache && cachedSnapshots) {
    return cachedSnapshots;
  }

  const result = await executeServerCommand(
    'get-snapshots',
    undefined,
    'snapshotPlugin from @web/test-runner-commands',
  );

  if (typeof result?.content !== 'string') {
    throw new Error('Expected a result as string');
  }

  const content = `${escapeContent(result.content)}/* ${Math.random()} */`;
  const module = await import(`data:text/javascript;charset=utf-8,${content}`);

  if (!module || !isObject(module.snapshots)) {
    throw new Error('Expected snapshot result to be a module that exports an object.');
  }

  cachedSnapshots = module.snapshots;

  return cachedSnapshots;
}

export async function getSnapshot(options) {
  if (!isObject(options)) throw new Error('You must provide a payload object');
  if (typeof options.name !== 'string') throw new Error('You must provide a snapshot name');

  const snapshots = await getSnapshots(options);

  return snapshots[options.name];
}

export async function saveSnapshot(options) {
  if (!isObject(options)) throw new Error('You must provide a payload object');
  if (typeof options.name !== 'string') throw new Error('You must provide a snapshot name');
  if (options.content !== undefined && typeof options.content !== 'string')
    throw new Error('You must provide a snapshot content');

  // ensure snapshots for this file are loaded
  const snapshots = await getSnapshots();

  // store snapshot in-memory
  snapshots[options.name] = options.content;

  return executeServerCommand(
    'save-snapshot',
    options,
    'snapshotPlugin from @web/test-runner-commands',
  );
}

export function removeSnapshot(options) {
  if (!isObject(options)) throw new Error('You must provide a payload object');
  if (typeof options.name !== 'string') throw new Error('You must provide a snapshot name');

  return saveSnapshot({ ...options, content: undefined });
}

export async function compareSnapshot({ name, content }) {
  const currentSnapshot = await getSnapshot({ name });
  if (currentSnapshot) {
    const config = await getSnapshotConfig();
    if (!config.updateSnapshots) {
      if (currentSnapshot !== content) {
        throw new Error(
          `Snapshots for ${name} are not equal. \n\n` +
            `Stored:\n${currentSnapshot}\n\n` +
            `New:\n${content}`,
        );
      }
    }
  }
  await saveSnapshot({ name, content });
}
