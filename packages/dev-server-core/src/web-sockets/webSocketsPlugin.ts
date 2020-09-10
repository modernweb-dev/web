import { parse as parseHtml } from 'parse5';
import { query, predicates } from '../dom5';
import { Plugin } from '../Plugin';
import { NAME_WEB_SOCKET_IMPORT } from './WebSocketsManager';

export const webSocketScript = `<!-- injected by web-dev-server -->
<script type="module" src="${NAME_WEB_SOCKET_IMPORT}"></script>`;

export function webSocketsPlugin(): Plugin {
  return {
    name: 'web-sockets',

    serve(context) {
      if (context.path === NAME_WEB_SOCKET_IMPORT) {
        return `export const webSocket = ('WebSocket' in window) ? new WebSocket(\`ws\${location.protocol === 'https:' ? 's': ''}://\${location.host}\`) : null;
if (webSocket) {
  webSocket.addEventListener('message', async (e) => {
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
}`;
      }
    },

    async transform(context) {
      if (context.response.is('html')) {
        const documentAst = parseHtml(context.body, { sourceCodeLocationInfo: true });
        const htmlNode = query(documentAst, predicates.hasTagName('html'));
        const bodyNode = query(documentAst, predicates.hasTagName('body'));
        if (!htmlNode?.sourceCodeLocation || !bodyNode?.sourceCodeLocation) {
          // if html or body tag does not have a source code location it was generated
          return;
        }

        const { startOffset } = bodyNode.sourceCodeLocation.endTag;
        const start = context.body.substring(0, startOffset);
        const end = context.body.substring(startOffset);
        return `${start}\n\n${webSocketScript}\n\n${end}`;
      }
    },
  };
}
