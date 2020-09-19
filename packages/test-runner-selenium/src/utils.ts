import { Capabilities } from 'selenium-webdriver';

/**
 * Wraps a Promise with a timeout, rejecing the promise with the timeout.
 */
export function withTimeout<T>(promise: Promise<T>, message: string, timeout: number): Promise<T> {
  return new Promise((resolve, reject) => {
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

const isDefined = (_: unknown) => !!_;

function getPlatform(c: Capabilities) {
  return (
    c.getPlatform() ||
    c.get('platform') ||
    [c.get('os'), c.get('os_version')].filter(isDefined).join(' ')
  );
}

function getBrowser(c: Capabilities) {
  return c.getBrowserName() || c.get('browserName') || c.get('browser_name');
}

function getBrowserVersion(c: Capabilities) {
  return c.getBrowserVersion() || c.get('browserVersion') || c.get('browser_version');
}

export function getBrowserName(c: Capabilities) {
  return [getPlatform(c), getBrowser(c), getBrowserVersion(c)].filter(_ => _).join(' ');
}
