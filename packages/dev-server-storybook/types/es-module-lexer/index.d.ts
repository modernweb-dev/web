declare module 'es-module-lexer' {
  interface ParsedImport {
    s: number;
    e: number;
    ss: number;
    se: number;
    d: number;
  }

  export async function parse(code: string, fileName: string): Promise<[ParsedImport[], string[]]>;
}
