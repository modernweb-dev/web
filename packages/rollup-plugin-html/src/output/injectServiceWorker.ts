import path from 'path';
import { Document } from 'parse5';
import {
  findElement,
  getTagName,
  appendChild,
  createScript,
  setAttribute,
} from '@web/parse5-utils';

export interface injectServiceWorkerArgs {
  document: Document;
  swDest: string;
  outputDir: string;
  htmlFileName: string;
}

export function injectServiceWorker(args: injectServiceWorkerArgs) {
  const { document, swDest, outputDir, htmlFileName } = args;
  const body = findElement(document, e => getTagName(e) === 'body');
  if (!body) {
    throw new Error('Missing body in HTML document.');
  }

  let swPath = swDest.replace(`${outputDir}/`, '');
  swPath = path.relative(path.dirname(htmlFileName), swPath);

  const code  = `
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker
          .register('${swPath}')
          .then(function() {
            console.log('ServiceWorker registered from "${swPath}".');
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
