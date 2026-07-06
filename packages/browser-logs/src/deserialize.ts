import { ParseStackTraceOptions, parseStackTrace } from './parseStackTrace.js';

const KEY_WTR_TYPE = '__WTR_TYPE__';
const KEY_CONSTRUCTOR_NAME = '__WTR_CONSTRUCTOR_NAME__';

const ASYNC_DESERIALIZE_WRAPPER = Symbol('ASYNC_DESERIALIZE_WRAPPER');

const BOUND_NAME_FUNCTION_REGEX = /^bound\s+/;

/**
 * Validates that a string is a safe JavaScript identifier before it is
 * interpolated into a new Function(...) call. Accepts only strings composed
 * of ASCII letters, digits, $ and _, with a non-digit first character.
 *
 * This prevents browser-controlled constructor/function names from breaking
 * out of the generated function declaration and executing arbitrary code in
 * the Node.js host process.
 */
const SAFE_IDENTIFIER_RE = /^[$A-Za-z_][$\w]*$/;

function isValidIdentifier(name: string): boolean {
  return SAFE_IDENTIFIER_RE.test(name);
}

function createReviver(promises: Promise<unknown>[], options?: DeserializeOptions) {
  const undefinedPropsPerObject = new Map();

  return function reviver(this: any, key: string, value: any) {
    if (value == null || typeof value !== 'object') {
      return value;
    }

    const undefinedKeysForObject = undefinedPropsPerObject.get(value);
    if (undefinedKeysForObject) {
      for (const undefinedKey of undefinedKeysForObject) {
        value[undefinedKey] = undefined;
      }
    }

    if (Array.isArray(value)) {
      return value;
    }

    /**
     * Revive special serialized values, such as functions and regexp
     */
    if (hasOwnProperty.call(value, KEY_WTR_TYPE)) {
      switch (value[KEY_WTR_TYPE]) {
        case 'undefined':
          {
            let keys = undefinedPropsPerObject.get(this);
            if (!keys) {
              keys = [];
              undefinedPropsPerObject.set(this, keys);
            }
            keys.push(key);
          }
          return;
        case 'Function': {
          const rawName = value.name.replace(BOUND_NAME_FUNCTION_REGEX, '');
          // Only allow names that are valid JS identifiers. Any payload that
          // tries to inject syntax (parentheses, spaces, commas, etc.) will
          // fail the check and be replaced with a safe literal fallback.
          const safeName = isValidIdentifier(rawName) ? rawName : 'anonymous';

          // Create a fake function with the same name. We don't log the function implementation.
          return new Function(`return function ${safeName}() { /* implementation hidden */ }`)();
        }
        case 'RegExp':
          // Create a new RegExp using the same parameters
          return new RegExp(value.source, value.flags);
        case 'Error': {
          let errorMsg = `${value.name}: ${value.message}`;
          if (value.stack) {
            const parsePromise = parseStackTrace(value.message, value.stack, options)
              .then(parsedStack => {
                if (parsedStack) {
                  // set the async deserialized error msg
                  errorMsg = `${errorMsg}\n${parsedStack}`;

                  if (this[key][ASYNC_DESERIALIZE_WRAPPER]) {
                    // replace the returned wrapper with the async value
                    // this only works when the error appears somewhere in an object
                    // or array, ex. deserialize({ myError: new Error('...') }) not when the
                    // top level object is the error: deserialize(new Error('...')) this case
                    // is handled in the serialize function
                    this[key] = this[key].value();
                  }
                }
              })
              .catch(error => {
                console.error(error);
              });
            promises.push(parsePromise);
          }
          // deserializing an error is async, return a wrapper that is unpacked later
          return { [ASYNC_DESERIALIZE_WRAPPER]: true, value: () => errorMsg };
        }
        case 'Promise':
          // Create a fake new Promise. Just to show that its a Promise.
          return `Promise { }`;
        default:
          throw new Error(`Unknown serialized type: ${value[KEY_WTR_TYPE]}`);
      }
    }

    /**
     * Objects in the browser are serialized to a simple object. We preserve the
     * constructor name and assign a fake prototype to it here so that the name
     * appears in the logs.
     */
    if (hasOwnProperty.call(value, KEY_CONSTRUCTOR_NAME)) {
      const rawName = value[KEY_CONSTRUCTOR_NAME];
      const safeName = isValidIdentifier(rawName) ? rawName : '__unknown__';

      const ConstructorFunction = new Function(`return function ${safeName}(){}`)();
      Object.setPrototypeOf(value, new ConstructorFunction());
      delete value[KEY_CONSTRUCTOR_NAME];
      return value;
    }

    return value;
  };
}

const { hasOwnProperty } = Object.prototype;

type DeserializeOptions = ParseStackTraceOptions;

export async function deserialize(value: string, options?: DeserializeOptions) {
  try {
    const promises: Promise<unknown>[] = [];
    const parsed = JSON.parse(value, createReviver(promises, options));

    // wait for any async work to finish
    await Promise.all(promises);
    if (parsed != null && parsed[ASYNC_DESERIALIZE_WRAPPER]) {
      // if deserialization of the top level object was async,
      // return the wrapped value which was provided async
      return parsed.value();
    }
    return parsed;
  } catch (error) {
    console.error('Error while deserializing browser logs.');
    console.error(error);
    return null;
  }
}
