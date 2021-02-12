import { Logger, ErrorWithLocation } from '@web/test-runner-core';

export class TestRunnerLogger implements Logger {
  loggedSyntaxErrors = new Map<string, ErrorWithLocation[]>();

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

  logSyntaxError(error: ErrorWithLocation) {
    const { message, code, filePath, column, line } = error;
    let errors = this.loggedSyntaxErrors.get(filePath);
    if (!errors) {
      errors = [];
      this.loggedSyntaxErrors.set(filePath, errors);
    } else if (
      errors.find(
        e => e.code === code && e.message === message && e.column === column && e.line === line,
      )
    ) {
      // dedupe syntax errors we already logged
      return;
    }
    errors.push(error);
  }

  clearLoggedSyntaxErrors() {
    this.loggedSyntaxErrors = new Map();
  }
}
