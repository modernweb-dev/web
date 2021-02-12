import { Logger, ErrorWithLocation } from '../logger/Logger';

export class BufferedLogger implements Logger {
  public buffer: { method: keyof Logger; args?: any[] }[] = [];

  constructor(private parent: Logger) {}

  log(...messages: unknown[]) {
    this.buffer.push({ method: 'log', args: messages });
  }

  debug(...messages: unknown[]) {
    this.buffer.push({ method: 'debug', args: messages });
  }

  error(...messages: unknown[]) {
    this.buffer.push({ method: 'error', args: messages });
  }

  warn(...messages: unknown[]) {
    this.buffer.push({ method: 'warn', args: messages });
  }

  group() {
    this.buffer.push({ method: 'group' });
  }

  groupEnd() {
    this.buffer.push({ method: 'groupEnd' });
  }

  logSyntaxError(error: ErrorWithLocation) {
    this.buffer.push({ method: 'logSyntaxError', args: [error] });
  }

  logBufferedMessages() {
    for (const { method, args = [] } of this.buffer) {
      (this.parent[method] as any)(...args);
    }
  }
}
