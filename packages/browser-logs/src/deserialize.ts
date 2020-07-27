const KEY_WTR_TYPE = '__WTR_TYPE__';
const KEY_CONSTRUCTOR_NAME = '__WTR_CONSTRUCTOR_NAME__';
export const MARKER_BROWSER_ERROR = '__WTR_BROWSER_ERROR__';

export interface BrowserError {
  __BROWSER_ERROR__: true;
  message: string;
  stack?: string;
}

const { hasOwnProperty } = Object.prototype;

function reviver(_: string, value: any) {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }

  /**
   * Revive special serialized values, such as functions and regexp
   */
  if (hasOwnProperty.call(value, KEY_WTR_TYPE)) {
    switch (value[KEY_WTR_TYPE]) {
      case 'Function':
        // Create a fake function with the same name. We don't log the function implementation.
        return new Function(`return function ${value.name}() { /* implementation hidden */ }`)();
      case 'RegExp':
        // Create a new RegExp using the same parameters
        return new RegExp(value.source, value.flags);
      case 'Error': {
        return { [MARKER_BROWSER_ERROR]: true, message: value.message, stack: value.stack };
      }
      default:
        throw new Error(`Unknown serialized type: ${value[KEY_WTR_TYPE]}`);
    }
  }

  /**
   * Objects in the browser are serialized to a simple object. We preserve the
   * constructor name and assign a fake prototpe to it here so that the name
   * appears in the logs.
   */
  if (hasOwnProperty.call(value, KEY_CONSTRUCTOR_NAME)) {
    const constructorName = value[KEY_CONSTRUCTOR_NAME];
    const ConstructorFunction = new Function(`return function ${constructorName}(){}`)();
    Object.setPrototypeOf(value, new ConstructorFunction());
    delete value[KEY_CONSTRUCTOR_NAME];
    return value;
  }

  return value;
}

export function deserialize(value: string) {
  return JSON.parse(value, reviver);
}
