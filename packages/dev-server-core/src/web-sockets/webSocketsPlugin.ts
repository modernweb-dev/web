import { Plugin } from '../plugins/Plugin';
import { NAME_WEB_SOCKET_IMPORT, NAME_WEB_SOCKET_API } from './WebSocketsManager';
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

        /**
         * Code at this indent adapted from fast-safe-stringify by David Mark Clements
         * @license MIT
         * @see https://github.com/davidmarkclements/fast-safe-stringify
         */
        var arr = []
        var replacerStack = []

        // Stable-stringify
        function compareFunction (a, b) {
          if (a < b) {
            return -1
          }
          if (a > b) {
            return 1
          }
          return 0
        }

        export function stable (obj, replacer, spacer) {
          var tmp = deterministicDecirc(obj, '', [], undefined) || obj
          var res
          if (replacerStack.length === 0) {
            res = JSON.stringify(tmp, replacer, spacer)
          } else {
            res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer)
          }
          while (arr.length !== 0) {
            var part = arr.pop()
            if (part.length === 4) {
              Object.defineProperty(part[0], part[1], part[3])
            } else {
              part[0][part[1]] = part[2]
            }
          }
          return res
        }

        function deterministicDecirc (val, k, stack, parent) {
          var i
          if (typeof val === 'object' && val !== null) {
            for (i = 0; i < stack.length; i++) {
              if (stack[i] === val) {
                var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k)
                if (propertyDescriptor.get !== undefined) {
                  if (propertyDescriptor.configurable) {
                    Object.defineProperty(parent, k, { value: '[Circular]' })
                    arr.push([parent, k, val, propertyDescriptor])
                  } else {
                    replacerStack.push([val, k])
                  }
                } else {
                  parent[k] = '[Circular]'
                  arr.push([parent, k, val])
                }
                return
              }
            }
            if (typeof val.toJSON === 'function') {
              return
            }
            stack.push(val)
            // Optimize for Arrays. Big arrays could kill the performance otherwise!
            if (Array.isArray(val)) {
              for (i = 0; i < val.length; i++) {
                deterministicDecirc(val[i], i, stack, val)
              }
            } else {
              // Create a temporary object in the required way
              var tmp = {}
              var keys = Object.keys(val).sort(compareFunction)
              for (i = 0; i < keys.length; i++) {
                var key = keys[i]
                deterministicDecirc(val[key], key, stack, val)
                tmp[key] = val[key]
              }
              if (parent !== undefined) {
                arr.push([parent, k, val])
                parent[k] = tmp
              } else {
                return tmp
              }
            }
            stack.pop()
          }
        }

        // wraps replacer function to handle values we couldn't replace
        // and mark them as [Circular]
        function replaceGetterValues (replacer) {
          replacer = replacer !== undefined ? replacer : function (k, v) { return v }
          return function (key, val) {
            if (replacerStack.length > 0) {
              for (var i = 0; i < replacerStack.length; i++) {
                var part = replacerStack[i]
                if (part[1] === key && part[0] === val) {
                  val = '[Circular]'
                  replacerStack.splice(i, 1)
                  break
                }
              }
            }
            return replacer.call(this, key, val)
          }
        }


const { protocol, host } = new URL(import.meta.url);
const webSocketUrl = \`ws\${protocol === 'https:' ? 's' : ''}://\${host}/${NAME_WEB_SOCKET_API}\`;

export let webSocket;
export let webSocketOpened;
export let sendMessage;
export let sendMessageWaitForResponse;
let getNextMessageId;

function setupFetch() {
  sendMessage = (message) =>fetch('/__web-test-runner__/wtr-legacy-browser-api', { method: 'POST', body: stable(message) });
  sendMessageWaitForResponse = (message) => fetch('/__web-test-runner__/wtr-legacy-browser-api', { method: 'POST', body: stable(message) });
}

function setupWebSocket() {
  let useParent = false;
  try {
    // if window is an iframe and accessing a cross origin frame is not allowed this will throw
    // therefore we try/catch it here so it does not disable all web sockets
    if (window.parent !== window && window.parent.__WDS_WEB_SOCKET__ !== undefined) {
      useParent = true;
    }
  } catch(e) {}

  if (useParent) {
    // get the websocket instance from the parent element if present
    const info = window.parent.__WDS_WEB_SOCKET__;
    webSocket = info.webSocket;
    webSocketOpened = info.webSocketOpened;
    getNextMessageId = info.getNextMessageId;
  } else {
    webSocket =
      'WebSocket' in window
      ? new WebSocket(webSocketUrl)
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

  sendMessage = async (message) => {
    if (!message.type) {
      throw new Error('Missing message type');
    }
    await webSocketOpened;
    webSocket.send(stable(message));
  }

  // sends a websocket message and expects a response from the server
  sendMessageWaitForResponse = async (message) => {
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
}

if (!!navigator.userAgent.match(/Trident/)) {
  setupFetch();
} else {
  setupWebSocket();
}
`;
      }
    },

    async transform(context) {
      if (context.response.is('html')) {
        if (typeof context.body !== 'string') {
          return;
        }
        if (isHtmlFragment(context.body)) {
          return;
        }
        return appendToDocument(context.body, webSocketScript);
      }
    },
  };
}
