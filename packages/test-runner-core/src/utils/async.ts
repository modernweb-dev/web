/**
 * Wraps a Promise with a timeout, rejecing the promise with the timeout.
 */
export function withTimeout<T>(
  promise: Promise<T> | void,
  message: string,
  timeout: number,
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!(promise instanceof Promise)) {
      resolve();
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
