export interface InputAsset {
  filePath: string;
  content: Buffer;
}

export interface InputData {
  html: string;
  name: string;
  moduleImports: string[];
  inlineModules: Map<string, string>;
  assets: InputAsset[];
  filePath?: string;
}
