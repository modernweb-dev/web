import { executeServerCommand } from '@web/test-runner-commands';

let i = 0;

const elements = {};
window.__WTR_VISUAL_REGRESSION__ = elements;

export async function visualDiff(element, name) {
  if (!(element instanceof Node)) {
    throw new Error('Element to diff must be a Node.');
  }

  if (!element.isConnected) {
    throw new Error('Element must be connected to the DOM.');
  }

  if (element.ownerDocument !== document) {
    throw new Error('Element must belong to the same document the tests are run in.');
  }

  if (typeof name !== 'string') {
    throw new Error('You must provide a name to diff');
  }

  i += 1;
  elements[i] = element;
  try {
    const result = await executeServerCommand('visual-diff', { id: String(i), name });
    if (!result) {
      throw new Error('Failed to execute visual diff.');
    }

    if (result.passed) {
      return;
    }

    if (typeof result.errorMessage === 'string') {
      throw new Error(result.errorMessage);
    }
    throw new Error('Failed to execute visual diff.');
  } finally {
    delete elements[i];
  }
}
