/* eslint-env browser, es2020 */
import { sendMessageWaitForResponse } from '/__web-dev-server__web-socket.js';

const PARAM_SESSION_ID = 'wtr-session-id';

const sessionId = new URL(window.location.href).searchParams.get(PARAM_SESSION_ID);

export async function executeServerCommand(command, payload) {
  if (typeof sessionId !== 'string') {
    throw new Error(
      'Unable to execute server commands in a browser not controlled by the test runner. ' +
        'Use the debug option from the watch menu to debug in a controlled browser.',
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
      throw new Error(
        `Unknown command ${command}. Did you install a plugin to handle this command?`,
      );
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
  return executeServerCommand('write-file', options);
}

export function readFile(options) {
  return executeServerCommand('read-file', options);
}

export function removeFile(options) {
  return executeServerCommand('remove-file', options);
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
