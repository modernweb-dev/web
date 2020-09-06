import { Plugin } from '@web/dev-server-core';
import debounce from 'debounce';

export function watchPlugin(): Plugin {
  return {
    name: 'watch',

    injectEventStream: true,

    serverStart({ fileWatcher, eventStreams }) {
      if (!eventStreams) {
        throw new Error('Cannot use watch mode when event streams are disabled.');
      }

      function onFileChanged() {
        eventStreams!.sendRunEvent('data:text/javascript,window.location.reload()');
      }

      const onChange = debounce(onFileChanged, 100);
      fileWatcher.addListener('change', onChange);
      fileWatcher.addListener('unlink', onChange);
    },
  };
}
