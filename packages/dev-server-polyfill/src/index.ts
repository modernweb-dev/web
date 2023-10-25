import { createPolyfillsData } from '@web/polyfills-loader';
import type { PolyfillsConfig } from '@web/polyfills-loader';
import type { Plugin } from '@web/dev-server-core';

export function polyfill(polyfillsConfig: PolyfillsConfig): Plugin {
  let polyfillScripts: string[];

  return {
    name: 'polyfills-loader',
    async serverStart() {
      const polyfillsData = await createPolyfillsData({ polyfills: polyfillsConfig });
    
      polyfillScripts = polyfillsData.map(({name, type, test, content}) => {
        return `
<!-- Injected by @web/dev-server-plugin-polyfill start -->
<script polyfill ${name} ${type === 'module' ? 'type="module"' : ''}>
if (${test}) {
  ${content}
}
</script>
<!-- Injected by @web/dev-server-plugin-polyfill end -->
        `
      });
    },
    transform(context) {
      if (context.response.is('html')) {
        return {
          // @ts-expect-error
          body: context.body.replace(
            /<body>/, `
            <body>
            ${polyfillScripts.join('\n')}
          `),
        };
      }
      return undefined;
    },
  };
}
