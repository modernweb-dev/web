export interface InputAsset {
  filePath: string;
  hashed: boolean;
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
