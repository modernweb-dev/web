# Building >> Rollup Plugin HTML || 20

Plugin for bundling HTML files. Bundles module scripts in HTML files and injects the hashed filenames.

## Installation

```
npm install --save-dev @web/rollup-plugin-html
```

## Usage

### Single page

If you have a single HTML page, you can set it as rollup input. This will be used by the HTML plugin as input for the plugin.

```js
import html from '@web/rollup-plugin-html';

export default {
  input: 'index.html',
  output: { dir: 'dist' },
  plugins: [
    // add HTML plugin
    html(),
  ],
};
```

### Multiple pages

If all pages share the same config, you can use a glob pattern to match multiple HTML files.

```js
import html from '@web/rollup-plugin-html';

export default {
  input: 'pages/*.html',
  output: { dir: 'dist' },
  plugins: [
    // add HTML plugin
    html(),
  ],
};
```

If your pages cannot be matched with a single glob, or if they need to be bundled with different configs, you create multiple instances of the HTML plugin and set the input in the plugin config.

```js
import html from '@web/rollup-plugin-html';

export default {
  output: { dir: 'dist' },
  plugins: [
    // add multiple HTML plugins
    html({ input: 'index.html' }),
    html({ input: 'static/page.html' }),
  ],
};
```

### Handling absolute paths

If your HTML file contains any absolute paths they will be resolved against the current working directory. You can set a different root directory in the config. Input paths will be resolved relative to this root directory as well.

```js
import html from '@web/rollup-plugin-html';

export default {
  input: 'index.html',
  output: { dir: 'dist' },
  plugins: [
    // add HTML plugin
    html({ rootDir: path.join(process.cwd(), '_site') }),
  ],
};
```

### Preserving directory structure

To preserve the directory structure of HTML files you can set the `flattenOutput` option to false. The directory structure relative to the root dir will be preserved.

In the example below, the following files:

- `_site/index.html`
- `_site/pages/page-b.html`
- `_site/pages/bar/page-c.html`

Will be output as:

- `dist/index.html`
- `dist/pages/page-b.html`
- `dist/pages/bar/page-c.html`

```js
import html from '@web/rollup-plugin-html';

export default {
  input: 'pages/**/*.html',
  output: { dir: 'dist' },
  plugins: [
    // add HTML plugin
    html({ rootDir: path.join(process.cwd(), '_site'), flattenOutput: false }),
  ],
};
```

### Transforming HTML files

You can add transform functions to modify the HTML page in the build, for example to inject scripts.

```js
import html from '@web/rollup-plugin-html';

export default {
  input: 'pages/**/*.html',
  output: { dir: 'dist' },
  plugins: [
    // add HTML plugin
    html({ transform: [html => html.replace('<body>', '<body><script>...</script>')] }),
  ],
};
```

## Type definitions

```ts
import { OutputChunk, OutputOptions, OutputBundle } from 'rollup';

export interface InputHTMLOptions {
  html?: string;
  path?: string;
  name?: string;
}

export interface RollupPluginHTMLOptions {
  input?: string | InputHTMLOptions | (string | InputHTMLOptions)[];
  flattenOutput?: boolean;
  rootDir?: string;
  publicPath?: string;
  transform?: TransformFunction | TransformFunction[];
}

export interface GeneratedBundle {
  name: string;
  options: OutputOptions;
  bundle: OutputBundle;
}

export interface EntrypointBundle extends GeneratedBundle {
  entrypoints: {
    // path to import the entrypoint, can be used in an import statement
    // or script tag directly
    importPath: string;
    // associated rollup chunk, useful if you need to get more information
    // about the chunk. See the rollup docs for type definitions
    chunk: OutputChunk;
  }[];
}

export interface InjectArgs {
  // if one of the input options was set, this references the HTML set as input
  html?: string;
  // the rollup bundle to be injected on the page. if there are multiple
  // rollup output options, this will reference the first bundle
  //
  // if one of the input options was set, only the bundled module script contained
  // in the HTML input are available to be injected in both the bundle and bundles
  // options
  bundle: EntrypointBundle;
  // the rollup bundles to be injected on the page. if there is only one
  // build output options, this will be an array with one option
  bundles: Record<string, EntrypointBundle>;
}

export interface TransformArgs {
  // see InjectArgs
  bundle: EntrypointBundle;
  // see InjectArgs
  bundles: Record<string, EntrypointBundle>;
  htmlFileName: string;
}

export type TransformFunction = (html: string, args: TransformArgs) => string | Promise<string>;
```
