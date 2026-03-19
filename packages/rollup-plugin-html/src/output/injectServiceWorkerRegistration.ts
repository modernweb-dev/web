import path from 'path';
import { Document } from 'parse5';
import {
  findElement,
  getTagName,
  appendChild,
  createScript,
  setAttribute,
} from '@web/parse5-utils';

export interface injectServiceWorkerRegistrationArgs {
  document: Document;
  serviceWorkerPath: string;
  outputDir: string;
  htmlFileName: string;
}

export function injectServiceWorkerRegistration(args: injectServiceWorkerRegistrationArgs) {
  const { document, serviceWorkerPath, outputDir, htmlFileName } = args;
  const body = findElement(document, e => getTagName(e) === 'body');
  if (!body) {
    throw new Error('Missing body in HTML document.');
  }

  let serviceWorkerUrl = path.relative(outputDir, serviceWorkerPath);
  serviceWorkerUrl = path.relative(path.dirname(htmlFileName), serviceWorkerUrl);
  serviceWorkerUrl = serviceWorkerUrl.split(path.sep).join('/');

  const code = `
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker
          .register('${serviceWorkerUrl}')
          .then(function() {
            console.log('ServiceWorker registered from "${serviceWorkerUrl}".');
          })
          .catch(function(err) {
            console.log('ServiceWorker registration failed: ', err);
          });
      });
    }
  `;

  const script = createScript({}, code);
  setAttribute(script, 'inject-service-worker', '');

  appendChild(body, script);
}
