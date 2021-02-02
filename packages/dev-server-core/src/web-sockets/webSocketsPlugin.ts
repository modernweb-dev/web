import { Plugin } from '../plugins/Plugin';
import { NAME_WEB_SOCKET_IMPORT } from './WebSocketsManager';
import { appendToDocument, isHtmlFragment } from '@web/parse5-utils';

export const webSocketScript = `<!-- injected by web-dev-server -->
<script type="module" src="${NAME_WEB_SOCKET_IMPORT}"></script>`;

export function webSocketsPlugin(): Plugin {
  return {
    name: 'web-sockets',

    resolveImport({ source }) {
      if (source === NAME_WEB_SOCKET_IMPORT) {
        return NAME_WEB_SOCKET_IMPORT;
      }
    },

    serve(context) {
      if (context.path === NAME_WEB_SOCKET_IMPORT) {
        // this code is inlined because TS compiles to CJS but we need this to be ESM
        return `
export let webSocket;
export let webSocketOpened;
let getNextMessageId;

if (window.parent !== window && window.parent.__WDS_WEB_SOCKET__ !== undefined) {
  // get the websocket instance from the parent element if present
  const info = window.parent.__WDS_WEB_SOCKET__;
  webSocket = info.webSocket;
  webSocketOpened = info.webSocketOpened;
  getNextMessageId = info.getNextMessageId;
} else {
  webSocket =
    'WebSocket' in window
      ? new WebSocket(\`ws\${location.protocol === 'https:' ? 's' : ''}://\${location.host}\`)
      : null;
  webSocketOpened = new Promise(resolve => {
    if (!webSocket) {
      resolve();
    } else {
      webSocket.addEventListener('open', () => {
        resolve();
      });
    }
  });
  let messageId = 0;
  getNextMessageId = function () {
    if (messageId >= Number.MAX_SAFE_INTEGER) {
      messageId = 0;
    }
    messageId += 1;
    return messageId;
  };
  window.__WDS_WEB_SOCKET__ = { webSocket, webSocketOpened, getNextMessageId };
}

export async function sendMessage(message) {
  if (!message.type) {
    throw new Error('Missing message type');
  }
  await webSocketOpened;
  webSocket.send(JSON.stringify(message));
}

// sends a websocket message and expects a response from the server
export function sendMessageWaitForResponse(message) {
  return new Promise(async (resolve, reject) => {
    const id = getNextMessageId();

    function onResponse(e) {
      const message = JSON.parse(e.data);
      if (message.type === 'message-response' && message.id === id) {
        webSocket.removeEventListener('message', onResponse);
        if (message.error) {
          reject(new Error(message.error));
        } else {
          resolve(message.response);
        }
      }
    }

    webSocket.addEventListener('message', onResponse);

    setTimeout(() => {
      webSocket.removeEventListener('message', onResponse);
      reject(
        new Error(
          \`Did not receive a server response for message with type \${message.type} within 20000ms\`,
        ),
      );
    }, 20000);

    sendMessage({ ...message, id });
  });
}

if (webSocket) {
  webSocket.addEventListener('message', async e => {
    try {
      const message = JSON.parse(e.data);
      if (message.type === 'import') {
        const module = await import(message.data.importPath);
        if (typeof module.default === 'function') {
          module.default(...(message.data.args || []));
        }
        return;
      }
    } catch (error) {
      console.error('[Web Dev Server] Error while handling websocket message.');
      console.error(error);
    }
  });
}
        `;
      }
    },

    async transform(context) {
      if (context.response.is('html')) {
        if (isHtmlFragment(context.body)) {
          return;
        }
        return appendToDocument(context.body, webSocketScript);
      }
    },
  };
}
