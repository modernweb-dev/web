import { Plugin } from '@web/dev-server-core';
import debounce from 'debounce';

export function watchPlugin(): Plugin {
  return {
    name: 'watch',

    injectWebSocket: true,

    serverStart({ fileWatcher, webSockets }) {
      if (!webSockets) {
        throw new Error('Cannot use watch mode when web sockets are disabled.');
      }

      function onFileChanged() {
        webSockets!.sendImport('data:text/javascript,window.location.reload()');
      }

      const onChange = debounce(onFileChanged, 100);
      fileWatcher.addListener('change', onChange);
      fileWatcher.addListener('unlink', onChange);
    },
  };
}
