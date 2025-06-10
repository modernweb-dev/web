import openBrowserWindow from 'open';
import path from 'path';
import { DevServerConfig } from './config/DevServerConfig.js';

function isValidURL(str: string) {
  try {
    return !!new URL(str);
  } catch (error) {
    return false;
  }
}

function getBasePath(basePath?: string) {
  if (!basePath) {
    return '';
  }
  if (basePath.endsWith('/')) {
    return basePath.substring(0, basePath.length - 1);
  }
  return basePath;
}

export async function openBrowser(config: DevServerConfig) {
  const basePath = getBasePath(config.basePath);
  let openPath: string;
  if (typeof config.open === 'string') {
    // user-provided open path
    openPath = (config.open as string) === '' ? '/' : config.open;
  } else if (config.appIndex) {
    const resolvedAppIndex = path.resolve(config.appIndex);
    const relativeAppIndex = path.relative(config.rootDir, resolvedAppIndex);
    const appIndexBrowserPath = `/${relativeAppIndex.split(path.sep).join('/')}`;
    const appIndexDir = path.dirname(appIndexBrowserPath);
    // if an appIndex was provided, use it's directory as open path
    openPath = `${basePath}${appIndexDir.endsWith('/') ? appIndexDir : `${appIndexDir}/`}`;
  } else {
    openPath = `${basePath}/`;
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
