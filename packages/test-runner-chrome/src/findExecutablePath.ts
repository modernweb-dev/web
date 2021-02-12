import { Launcher as ChromeLauncher } from 'chrome-launcher';

export function findExecutablePath(): string {
  const path = ChromeLauncher.getFirstInstallation();
  if (!path) {
    throw new Error(
      'Could not automatically find any installation of Chrome using chrome-launcher. ' +
        'Set the CHROME_PATH to help chrome-launcher find it, or use ' +
        '@web/test-runner-puppeteer or @web/test-runner-playwright for a bundled browser.',
    );
  }

  return path;
}
