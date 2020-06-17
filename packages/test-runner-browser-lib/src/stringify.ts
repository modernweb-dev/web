export function stringify(value: unknown, depth = 5): string {
  if (depth === 0) {
    return '...';
  }

  if (value == null) {
    if (value === null) {
      return 'null';
    }
    return 'undefined';
  }

  switch (typeof value) {
    case 'object':
      if (Array.isArray(value)) {
        return `[${value.map(v => stringify(v, depth - 1)).join(', ')}]`;
      }

      if (value instanceof Date) {
        return value.toString();
      }

      if (value instanceof Text) {
        return `Text: ${value.nodeValue ?? ''}`;
      }

      if (value instanceof Comment) {
        return `Comment: ${value.nodeValue}`;
      }

      if (value instanceof Element) {
        return value.outerHTML;
      }

      if (value instanceof Error) {
        return `${value.toString()} ${value.stack}`;
      }

      return value ? serializeObject(value as Record<string, unknown>, depth) : 'undefined';
    case 'undefined':
      return 'undefined';
    case 'function':
      // function abc(a, b, c) { /* code goes here */ }
      //   -> function abc(a, b, c) { ... }
      return value.toString().replace(/\{[\s\S]*\}/, '{ ... }');

    // fall through for known cases we want to toString
    case 'symbol':
    case 'string':
    case 'boolean':
    default:
      try {
        return (value as any).toString();
      } catch {
        try {
          return JSON.stringify(value);
        } catch {
          return '<could not be serialized>';
        }
      }
  }
}

function serializeObject(value: Record<string, unknown>, depth: number) {
  const className = value?.constructor?.name;
  const prefix = className && className !== 'Object' ? className : null;

  const serializedEntries = [];
  for (const [key, subValue] of Object.entries(value)) {
    serializedEntries.push(`${key}: ${stringify(subValue, depth - 1)}`);
  }

  return `${prefix ? `${prefix}: ` : ''}{ ${serializedEntries.join(', ')} }`;
}
