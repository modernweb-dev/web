import { PluginSyntaxError } from './PluginSyntaxError';

export interface Logger {
  log(...messages: unknown[]): void;
  debug(...messages: unknown[]): void;
  error(...messages: unknown[]): void;
  warn(...messages: unknown[]): void;
  logSyntaxError(error: PluginSyntaxError): void;
}
