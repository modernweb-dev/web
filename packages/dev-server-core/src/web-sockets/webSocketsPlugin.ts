import { Plugin } from '../plugins/Plugin.js';
import { NAME_WEB_SOCKET_IMPORT, NAME_WEB_SOCKET_API } from './WebSocketsManager.js';
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
         * StructuredJSON copied as-is from https://github.com/ungap/structured-clone/blob/v1.2.0/structured-json.js
         */
        var StructuredJSON=function(e){"use strict";const r="object"==typeof self?self:globalThis,t=e=>((e,t)=>{const s=(r,t)=>(e.set(t,r),r),n=c=>{if(e.has(c))return e.get(c);const[o,a]=t[c];switch(o){case 0:case-1:return s(a,c);case 1:{const e=s([],c);for(const r of a)e.push(n(r));return e}case 2:{const e=s({},c);for(const[r,t]of a)e[n(r)]=n(t);return e}case 3:return s(new Date(a),c);case 4:{const{source:e,flags:r}=a;return s(new RegExp(e,r),c)}case 5:{const e=s(new Map,c);for(const[r,t]of a)e.set(n(r),n(t));return e}case 6:{const e=s(new Set,c);for(const r of a)e.add(n(r));return e}case 7:{const{name:e,message:t}=a;return s(new r[e](t),c)}case 8:return s(BigInt(a),c);case"BigInt":return s(Object(BigInt(a)),c)}return s(new r[o](a),c)};return n})(new Map,e)(0),s="",{toString:n}={},{keys:c}=Object,o=e=>{const r=typeof e;if("object"!==r||!e)return[0,r];const t=n.call(e).slice(8,-1);switch(t){case"Array":return[1,s];case"Object":return[2,s];case"Date":return[3,s];case"RegExp":return[4,s];case"Map":return[5,s];case"Set":return[6,s]}return t.includes("Array")?[1,t]:t.includes("Error")?[7,t]:[2,t]},a=([e,r])=>0===e&&("function"===r||"symbol"===r),u=(e,{json:r,lossy:t}={})=>{const s=[];return((e,r,t,s)=>{const n=(e,r)=>{const n=s.push(e)-1;return t.set(r,n),n},u=s=>{if(t.has(s))return t.get(s);let[i,f]=o(s);switch(i){case 0:{let r=s;switch(f){case"bigint":i=8,r=s.toString();break;case"function":case"symbol":if(e)throw new TypeError("unable to serialize "+f);r=null;break;case"undefined":return n([-1],s)}return n([i,r],s)}case 1:{if(f)return n([f,[...s]],s);const e=[],r=n([i,e],s);for(const r of s)e.push(u(r));return r}case 2:{if(f)switch(f){case"BigInt":return n([f,s.toString()],s);case"Boolean":case"Number":case"String":return n([f,s.valueOf()],s)}if(r&&"toJSON"in s)return u(s.toJSON());const t=[],l=n([i,t],s);for(const r of c(s))!e&&a(o(s[r]))||t.push([u(r),u(s[r])]);return l}case 3:return n([i,s.toISOString()],s);case 4:{const{source:e,flags:r}=s;return n([i,{source:e,flags:r}],s)}case 5:{const r=[],t=n([i,r],s);for(const[t,n]of s)(e||!a(o(t))&&!a(o(n)))&&r.push([u(t),u(n)]);return t}case 6:{const r=[],t=n([i,r],s);for(const t of s)!e&&a(o(t))||r.push(u(t));return t}}const{message:l}=s;return n([i,{name:f,message:l}],s)};return u})(!(r||t),!!r,new Map,s)(e),s},{parse:i,stringify:f}=JSON,l={json:!0,lossy:!0};return e.parse=e=>t(i(e)),e.stringify=e=>f(u(e,l)),e}({});

        // Not the exact same behaviour as structuredClone, but good enough for the basic cases.
        const structuredClonePolyfill = (obj) => StructuredJSON.parse(StructuredJSON.stringify(obj));

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
          var target = ('structuredClone' in globalThis) ? structuredClone(obj) : structuredClonePolyfill(obj)
          var tmp = deterministicDecirc(target, '', [], undefined) || target
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
