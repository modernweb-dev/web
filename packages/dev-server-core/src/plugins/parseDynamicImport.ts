const REGEXP_WHITESPACE = /\s/;

function getDynamicImportStartAndEnd(str: string, codeStart: number) {
  let start = -1;
  let end = -1;

  for (let i = 0; i < str.length; i += 1) {
    const isWhitespace = REGEXP_WHITESPACE.test(str[i]);
    if (start === -1) {
      if (!isWhitespace) {
        start = i;
      }
    }

    if (isWhitespace) {
      if (end === -1) {
        // we hit the end of a word, set the previous index as the last
        end = i - 1;
      }
    } else if (i === str.length - 1) {
      // we are at the end of the string
      if (end === -1) {
        end = i;
      }
    } else {
      // we're in a word or we hit a new word
      end = -1;
    }
  }

  return { dynamicStart: codeStart + start, dynamicEnd: codeStart + end + 1 };
}

export function parseDynamicImport(code: string, start: number, end: number) {
  const rawDynamicImport = code.substring(start, end);
  const { dynamicStart, dynamicEnd } = getDynamicImportStartAndEnd(rawDynamicImport, start);

  const importString = code.substring(dynamicStart, dynamicEnd);
  const importSpecifier = importString.substring(1, importString.length - 1);
  const startSymbol = code[dynamicStart];
  const stringLiteral = [`\``, "'", '"'].includes(startSymbol);
  const concatenatedString =
    startSymbol === `\`` || importSpecifier.includes("'") || importSpecifier.includes('"');

  return {
    importString,
    importSpecifier: stringLiteral ? importSpecifier : importString,
    stringLiteral,
    concatenatedString,
    dynamicStart,
    dynamicEnd,
  };
}
