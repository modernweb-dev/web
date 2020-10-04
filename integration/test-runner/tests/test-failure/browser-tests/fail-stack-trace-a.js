import { throwErrorB } from './fail-stack-trace-b.js';

export function throwErrorA() {
  return throwErrorB();
}
