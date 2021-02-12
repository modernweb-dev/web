import { InputOptions } from 'rollup';
import { createError } from '../utils';

function fromEntries<V>(entries: [string, V][]) {
  const obj: Record<string, V> = {};
  for (const [k, v] of entries) {
    obj[k] = v;
  }
  return obj;
}

export function addRollupInput(inputOptions: InputOptions, inputModuleIds: string[]): InputOptions {
  // Add input module ids to existing input option, whether it's a string, array or object
  // this way you can use multiple html plugins all adding their own inputs
  if (!inputOptions.input) {
    return { ...inputOptions, input: inputModuleIds };
  }

  if (typeof inputOptions.input === 'string') {
    return { ...inputOptions, input: [inputOptions.input, ...inputModuleIds] };
  }

  if (Array.isArray(inputOptions.input)) {
    return { ...inputOptions, input: [...inputOptions.input, ...inputModuleIds] };
  }

  if (typeof inputOptions.input === 'object') {
    return {
      ...inputOptions,
      input: {
        ...inputOptions.input,
        ...fromEntries(inputModuleIds.map(i => [i.split('/').slice(-1)[0].split('.')[0], i])),
      },
    };
  }

  throw createError(`Unknown rollup input type. Supported inputs are string, array and object.`);
}
