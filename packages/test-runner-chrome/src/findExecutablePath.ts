import fs from 'fs';
import { homedir, platform } from 'os';
import { Launcher as ChromeLauncher } from 'chrome-launcher';

const macOSinstallations = [
  `${homedir}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
  `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
];

function isValid(file: string) {
  try {
    fs.existsSync(file);
    fs.accessSync(file);
    return true;
  } catch {
    return false;
  }
}

export function findExecutablePath(): string {
  if (platform() === 'darwin') {
    for (const path of macOSinstallations) {
      if (isValid(path)) {
        return path;
      }
    }
  }

  const start = Date.now();
  const path = ChromeLauncher.getInstallations()[0];
  if (!path) {
    throw new Error(
      'Could not automatically find any installation of Chrome. ' +
        'If it is installed, use the "installationPath" option to set it manually.  ' +
        'Use @web/test-runner-puppeteer or @web/test-runner-playwright for a bundled browser.',
    );
  }

  if (Date.now() - start > 1500) {
    console.warn(
      'It took a long time to find your local installation of Chrome. ' +
        "It's recommended to pass this executable path manually to prevent the slow lookup: " +
        path,
    );
  }
  return path;
}
