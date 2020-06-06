import { throwErrorC } from './fail-stack-trace-c.js';

export function throwErrorB() {
  return throwErrorC();
}
