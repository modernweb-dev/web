import { ScriptModuleTag } from '../RollupPluginHTMLOptions';

export interface InputAsset {
  filePath: string;
  hashed: boolean;
  content: Buffer;
}

export interface InputData {
  html: string;
  name: string;
  moduleImports: ScriptModuleTag[];
  inlineModules: ScriptModuleTag[];
  assets: InputAsset[];
  filePath?: string;
}
