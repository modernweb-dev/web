export function createStackLocationRegExp(protocol: string, hostname: string, port: number) {
  return new RegExp(
    // must start with a space and an optional (, OR with a @ and an optional space
    `(\\s\\(*|@\\s*)` +
      // may optionally contain the server address, in which case it is stripped off
      `(?:${protocol}\\/\\/${hostname}:${port}\\/)*` +
      // must contain valid URL characters, and end with a file extension
      '((?:[a-z]|[A-Z]|\\-|-|\\.|_|~|\\/|\\\\)*\\.\\w{2,6})' +
      // may optionally contain query params or hashes, which are stripped off
      '(?:.*)' +
      // must contain line and column markers
      '(?::(\\d+))(?::(\\d+))' +
      // must end at the end of the string, with an optional )
      '(\\)$|$)',
  );
}
