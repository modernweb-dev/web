# Test Runner Server

Server for communicating with the browser and serving test files, based on [es-dev-server](https://github.com/open-wc/open-wc/tree/master/packages/es-dev-server).

See [@web/test-runner](https://github.com/modernweb-dev/web/tree/master/packages/test-runner) for a default implementation and CLI for the test runner.

The dev server has a lot of configuration options and a plugin system. Check out the [es-dev-server docs](https://github.com/open-wc/open-wc/tree/master/packages/es-dev-server#configuration-files) for all possible options.

If you're using `@web/test-runner`, you can configure the dev server from the configuration file. For example:

```js
import proxy from 'koa-proxies';
import awesomePlugin from 'awesome-plugin';

export default {
  devServer: {
    rootDir: '../..',
    moduleDirs: ['node_modules', 'fancy_modules'],
    middlewares: [
      proxy('/api', {
        target: 'http://localhost:9001',
      }),
    ],
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
