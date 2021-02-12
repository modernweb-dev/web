import type { Plugin } from '@web/dev-server-core';
import { HmrPlugin } from './HmrPlugin';

export function hmrPlugin(): Plugin {
  return new HmrPlugin();
}
