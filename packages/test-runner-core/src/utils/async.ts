/**
 * Wraps a Promise with a timeout, rejecing the promise with the timeout.
 */
export function withTimeout<T>(
  promise: Promise<T> | void,
  message: string,
  timeout: number,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (!(promise instanceof Promise)) {
      (resolve as any)();
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, timeout);

    promise
      .then(val => {
        resolve(val);
      })
      .catch(err => {
        reject(err);
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });
  });
}

/**
 * Iterates iterable, executes each function in parallel and awaits
 * all function return values
 */
export async function forEachAsync<T>(
  it: Iterable<T>,
  fn: (t: T) => void | Promise<void>,
): Promise<void> {
  const result: (void | Promise<void>)[] = [];
  for (const e of it) {
    result.push(fn(e));
  }
  await Promise.all(result);
}

/**
 * Iterates iterable, executes each function in parallel and awaits
 * all function return values returning the awaited result
 */
export function mapAsync<T, R>(it: Iterable<T>, fn: (t: T) => R | Promise<R>): Promise<R[]> {
  const result: (R | Promise<R>)[] = [];
  for (const e of it) {
    result.push(fn(e));
  }
  return Promise.all(result);
}
