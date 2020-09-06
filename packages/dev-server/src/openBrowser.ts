import openBrowserWindow from 'open';
import path from 'path';
import { DevServerConfig } from './config/DevServerConfig';

function isValidURL(str: string) {
  try {
    return !!new URL(str);
  } catch (error) {
    return false;
  }
}

export async function openBrowser(config: DevServerConfig) {
  let openPath: string;
  if (typeof config.open === 'string') {
    // user-provided open path
    openPath = (config.open as string) === '' ? '/' : config.open;
  } else if (config.appIndex) {
    // if an appIndex was provided, use it's directory as open path
    openPath = `${config.basePath ?? ''}${path.dirname(config.appIndex)}/`;
  } else {
    openPath = config.basePath ? `${config.basePath}/` : '/';
  }

  if (!isValidURL(openPath)) {
    // construct a full URL to open if the user didn't provide a full URL
    openPath = new URL(
      openPath,
      `http${config.http2 ? 's' : ''}://${config.hostname}:${config.port}`,
    ).href;
  }

  await openBrowserWindow(openPath);
}
