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

export function getBrowserName(c: Capabilities): string {
  return c.getBrowserName() || c.get('browserName') || c.get('browser_name');
}

function getBrowserVersion(c: Capabilities): string {
  return c.getBrowserVersion() || c.get('browserVersion') || c.get('browser_version');
}

export function getBrowserLabel(c: Capabilities): string {
  return [getPlatform(c), getBrowserName(c), getBrowserVersion(c)].filter(_ => _).join(' ');
}
