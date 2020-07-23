export interface ErrorWithLocation {
  name: string;
  message: string;
  filePath: string;
  code: string;
  line: number;
  column: number;
}

export interface Logger {
  log(...messages: unknown[]): void;
  debug(...messages: unknown[]): void;
  error(...messages: unknown[]): void;
  warn(...messages: unknown[]): void;
  group(): void;
  groupEnd(): void;
  logSyntaxError(error: ErrorWithLocation): void;
}
