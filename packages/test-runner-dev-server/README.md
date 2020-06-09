# Test Runner Dev Server

Server for serving test files, based on [es-dev-server](https://github.com/open-wc/open-wc/tree/master/packages/es-dev-server).

See [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner) for a default implementation.

The dev server has a lot of configuration options and a plugin system. Check out the [es-dev-server docs](https://github.com/open-wc/open-wc/tree/master/packages/es-dev-server#configuration-files) for all possible options.

If you're using `@web/test-runner`, you can configure the dev server from the configuration file. For example:

```js
import awesomePlugin from 'awesome-plugin';

export default {
  devServer: {
    rootDir: '../..',
    moduleDirs: ['node_modules', 'fancy_modules'],
    plugins: [
      // use a plugin
      awesomePlugin({ someOption: 'someProperty' }),
      // create an inline plugin
      {
        transform(context) {
          if (context.path === '/src/environment.js') {
            return { body: `export const version = '${packageJson.version}';` };
          }
        },
      },
    ],
  },
};
```
