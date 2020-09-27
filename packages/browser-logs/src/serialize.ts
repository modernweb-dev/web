/* eslint-disable no-var */
var KEY_WTR_TYPE = '__WTR_TYPE__';
var KEY_CONSTRUCTOR_NAME = '__WTR_CONSTRUCTOR_NAME__';

/* eslint-disable @typescript-eslint/ban-types */
function catchFallback<T>(fn: (...args: any[]) => T, fallback = null) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

function serializeObject(value: any) {
  if (value instanceof Text || value instanceof Comment) {
    return value.constructor.name + ': ' + value.nodeValue || '';
  }

  if (value instanceof Element) {
    return value.constructor.name + ': ' + value.outerHTML;
  }

  if (value instanceof RegExp) {
    return {
      [KEY_WTR_TYPE]: 'RegExp',
      flags: value.flags,
      source: value.source,
    };
  }

  if (value instanceof Error) {
    return {
      [KEY_WTR_TYPE]: 'Error',
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  var stringified = catchFallback(function () {
    return JSON.stringify(value);
  });
  if (stringified === '{}') {
    var toStringed = catchFallback(function () {
      return value.toString();
    });
    if (toStringed && !toStringed.startsWith('[object')) {
      // some built-in objects like URLSearchParams stringify to {} while toString
      // provides useful information
      var name = value.constructor && value.constructor.name && value.constructor.name;
      return name ? name + ': ' + toStringed : toStringed;
    }
  }

  if (value.constructor && value.constructor.name && value.constructor.name !== 'Object') {
    try {
      value[KEY_CONSTRUCTOR_NAME] = value.constructor.name;
    } catch {
      // some objects don't allow being written to
    }
    return value;
  }

  return value;
}

function createReplacer() {
  // maintain a stack of seen objects to handle circular references
  var objectStack: any[] = [];

  return function replacer(this: any, key: string, value: unknown) {
    if (this[KEY_WTR_TYPE]) {
      return value;
    }

    // move up the stack if we just stepped out of an object
    while (objectStack.length && this !== objectStack[0]) {
      objectStack.shift();
    }

    if (value === undefined) {
      return { [KEY_WTR_TYPE]: 'undefined' };
    }

    if (value instanceof Promise) {
      return { [KEY_WTR_TYPE]: 'Promise' };
    }

    if (value == null) {
      return value;
    }

    var type = typeof value;
    if (type === 'function') {
      return {
        [KEY_WTR_TYPE]: 'Function',
        name: (value as Function).name,
      };
    }

    if (type === 'symbol') {
      return (value as Symbol).toString();
    }

    if (type === 'object') {
      if (objectStack.includes(value)) {
        // this object already one of the parents, break the circular reference
        return '[Circular]';
      }
      objectStack.unshift(value);

      if (Array.isArray(value)) {
        return value;
      }
      return serializeObject(value);
    }

    return value;
  };
}

export function serialize(value: unknown) {
  return JSON.stringify(value, createReplacer());
}
