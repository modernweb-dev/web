const validUrlChars = "\\w|-|\\.|_|~|:|\\/|\\\\|\\[|\\]|@|!|\\$|&|'|\\(|\\)|\\*|\\+|,|;|%";

export function createStackLocationRegExp(protocol: string, hostname: string, port: number) {
  return new RegExp(
    // must start with a space and an optional (, OR with a @ and an optional space
    `(\\s\\(|\\s|@)` +
      // may optionally contain the server address, in which case it is stripped off
      `(?:${protocol}\\/\\/${hostname}:${port}\\/)*` +
      // must contain valid URL characters and end witha file extension
      `((?:${validUrlChars})*\\.\\w{2,6})` +
      // must end with a file extension
      // may optionally contain query params or hashes, which are stripped off
      `(?:(?:${validUrlChars}|#|\\?|=)*)` +
      // must contain line and column markers
      '(?::(\\d+))(?::(\\d+))' +
      // must end at the end of the string, with an optional )
      '(\\)$|$)',
  );
}
