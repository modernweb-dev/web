export class PluginSyntaxError extends Error {
  constructor(
    public message: string,
    public filePath: string,
    public code: string,
    public line: number,
    public column: number,
  ) {
    super(message);
    this.name = 'PluginSyntaxError';
  }
}
