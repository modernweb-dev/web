/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import {
  query,
  predicates,
  // @ts-ignore
} from '@open-wc/building-utils/dom5-fork';
import { parse as parseHtml } from 'parse5';
import { Plugin } from '../Plugin';
import { EVENT_STREAM_ENDPOINT } from './eventStreamMiddleware';

export const eventStreamScript = `<!-- injected by web-dev-server -->
<script type="module">
  if (window.EventSource) {
    const eventSource = new EventSource('${EVENT_STREAM_ENDPOINT}');

    eventSource.addEventListener('message', (e) => {
      console.log(JSON.parse(e.data));
    });

    eventSource.addEventListener('run', (e) => {
      const payload = JSON.parse(e.data);
      const module = import(payload.path);
      if (typeof module.default === 'function') {
        module.default(...(payload.args || []));
      }
    });
  }
</script>
<!-- end of injected by web-dev-server -->`;

export function eventStreamPlugin(): Plugin {
  return {
    name: 'message-channel',

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
        return `${start}\n\n${eventStreamScript}\n\n${end}`;
      }
    },
  };
}
