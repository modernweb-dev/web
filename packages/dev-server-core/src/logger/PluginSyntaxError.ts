export interface ErrorLocation {
  file: string;
  line: number;
  column: number;
}

export class PluginSyntaxError extends Error {
  constructor(message: string, public location: ErrorLocation) {
    super(message);
  }
}
