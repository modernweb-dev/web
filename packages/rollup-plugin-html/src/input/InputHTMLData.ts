export interface InputHTMLData {
  html: string;
  name: string;
  moduleImports: string[];
  inlineModules: Map<string, string>;
  filePath?: string;
}
