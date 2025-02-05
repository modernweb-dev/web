import { stringifyProcessEnvs as storybookStringifyProcessEnvs } from '@storybook/core-common';

export function stringifyProcessEnvs(env: Record<string, string>) {
  const result = storybookStringifyProcessEnvs(env);

  // "NODE_PATH" pollutes the output, it's not really used and is not recommended in general
  // see more https://github.com/nodejs/node/issues/38128#issuecomment-814969356
  delete result['process.env.NODE_PATH'];

  return result;
}
