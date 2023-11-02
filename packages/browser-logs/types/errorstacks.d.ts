// While `errorstacks` doesn't export it's types we maintain our own declaration file.
// See: https://github.com/marvinhagemeister/errorstacks/pull/22#issuecomment-1775961444
declare module 'errorstacks' {
  declare const StackFrame = {
    column: unknown,
    line: unknown,
    fileName: unknown,
    raw: string,
    name: unknown,
    type: unknown,
  };
  declare function parseStackTrace(rawStack: unknown): StackFrame[]
}
