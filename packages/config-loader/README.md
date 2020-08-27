# Config Loader

Load user config files for node js projects. Supports loading config as es module or common js module, based on the user's node version, package type and file extension. Prints helpful error messages when invalid syntax combinations are used.

Follows node's logic for deciding how to load a file. `.mjs` files are loaded as es module, `.cjs` as common js. `.js` files are loaded based on the `type` field of the package.json.

## Usage

```bash
npm i --save-dev @web/config-loader
```

```js
import { readConfig, ConfigLoaderError } from '@web/config-loader';
// Or as a commonjs module
// const { readConfig, ConfigLoaderError } = require('@web/config-loader');

(async () => {
  try {
    // will look for:
    // process.cwd() + 'my-project.config.mjs'
    // process.cwd() + 'my-project.config.cjs'
    // process.cwd() + 'my-project.config.js'
    const config = await readConfig('my-project.config');
  } catch (error) {
    if (error instanceof ConfigLoaderError) {
      // If the error is a ConfigLoaderError it has a human readable error message
      // there is no need to print the stack trace.
      console.error(error.message);
      return;
    }
    console.error(error);
    return;
  }
})();
```

### Custom config file

If you want to let users define a custom config file location, you can pass this as a second optional parameter.

```js
const { readConfig, ConfigLoaderError } = require('@web/config-loader');

(async () => {
  try {
    const optionalCustomConfigFilePath = '...';
    const config = await readConfig('my-project.config', optionalCustomConfigFilePath);
  } catch (error) {
    if (error instanceof ConfigLoaderError) {
      // If the error is a ConfigLoaderError it has a human readable error message
      // there is no need to print the stack trace.
      console.error(error.message);
      return;
    }
    console.error(error);
    return;
  }
})();
```
