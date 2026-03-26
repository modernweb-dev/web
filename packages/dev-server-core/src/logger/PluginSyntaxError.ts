export class PluginSyntaxError extends Error {
  public message: string;
  public filePath: string;
  public code: string;
  public line: number;
  public column: number;

  constructor(message: string, filePath: string, code: string, line: number, column: number) {
    super(message);
    this.message = message;
    this.filePath = filePath;
    this.code = code;
    this.line = line;
    this.column = column;
    this.name = 'PluginSyntaxError';
  }
}
