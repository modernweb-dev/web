import { Logger, PluginSyntaxError } from '@web/dev-server-core';
import { codeFrameColumns } from '@babel/code-frame';
import path from 'path';

export class TestServerLogger implements Logger {
  constructor(private debugLogging: boolean) {}

  log(...messages: unknown[]) {
    console.log(...messages);
  }

  debug(...messages: unknown[]) {
    if (this.debugLogging) {
      console.debug(...messages);
    }
  }

  error(...messages: unknown[]) {
    console.error(...messages);
  }

  warn(...messages: unknown[]) {
    console.warn(...messages);
  }

  logSyntaxError(error: PluginSyntaxError) {
    const { message, code, filePath, column, line } = error;
    const result = codeFrameColumns(code, { start: { line, column } }, { highlightCode: true });
    console.error(`Error while transforming ${path.relative(process.cwd(), filePath)}: ${message}`);
    console.error(result);
  }
}
