import { Logger, PluginSyntaxError } from '@web/dev-server-core';
import { codeFrameColumns } from '@babel/code-frame';
import path from 'path';
import chalk from 'chalk';

export class DevServerLogger implements Logger {
  constructor(private debugLogging: boolean = false) {}

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

  group() {
    console.group();
  }

  groupEnd() {
    console.groupEnd();
  }

  logSyntaxError(error: PluginSyntaxError) {
    const { message, code, filePath, column, line } = error;
    const result = codeFrameColumns(code, { start: { line, column } }, { highlightCode: true });
    const relativePath = path.relative(process.cwd(), filePath);
    console.error(
      chalk.red(`Error while transforming ${chalk.cyanBright(relativePath)}: ${message}`),
    );
    console.error(result);
    console.error('');
  }
}
