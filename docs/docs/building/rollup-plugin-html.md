# Building >> Rollup Plugin HTML || 20

Plugin for bundling HTML files. Bundles module scripts and linked assets in HTML files and injects the hashed filenames.

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
  plugins: [html()],
};
```

### Multiple pages

If all pages share the same config, you can use a glob pattern to match multiple HTML files.

```js
import html from '@web/rollup-plugin-html';

export default {
  input: 'pages/*.html',
  output: { dir: 'dist' },
  plugins: [html()],
};
```

If your pages cannot be matched with a single glob you can set the input directly on HTML plugin.

```js
import html from '@web/rollup-plugin-html';

export default {
  output: { dir: 'dist' },
  plugins: [html({ input: ['index.html', 'static/page.html'] })],
};
```

If each input should be bundled with a different config, you can create multiple instances of the HTML plugin.

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

### HTML as string

If your HTML file does not exist on disk, you can provide it as a string as well.

```js
import html from '@web/rollup-plugin-html';

export default {
  output: { dir: 'dist' },
  plugins: [
    html({
      input: {
        html: '<html><body><script type="module" src="./app.js"></script></body></html>',
        // defaults to index.html
        name: 'foo.html',
      },
    }),
  ],
};
```

This can also be set as an array:

```js
import html from '@web/rollup-plugin-html';

export default {
  output: { dir: 'dist' },
  plugins: [
    html({
      input: [
        { html: '<html><body><script type="module" src="./app.js"></script></body></html>' },
        { html: '<html><body><script type="module" src="./foo.js"></script></body></html>' },
      ],
    }),
  ],
};
```

### Bundling assets

The HTML plugin will bundle assets referenced from `img` and `link` elements in your HTML. The assets are emitted as rollup assets, and the paths are updated to the rollup output paths.

By default rollup will hash the asset filenames, enabling long term caching. You can customize the filename pattern using the [assetFileNames option](https://rollupjs.org/guide/en/#outputassetfilenames) in your rollup config.

To turn off bundling assets completely, set the `extractAssets` option to false:

```js
import html from '@web/rollup-plugin-html';

export default {
  input: 'index.html',
  output: { dir: 'dist' },
  plugins: [
    html({
      extractAssets: false,
    }),
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

### Transforming HTML files and assets

You can add transform functions to modify the HTML page and assets in the build, for example to inject scripts or minification.

```js
import html from '@web/rollup-plugin-html';

export default {
  input: 'pages/**/*.html',
  output: { dir: 'dist' },
  plugins: [
    // add HTML plugin
    html({
      transformHtml: [html => html.replace('<body>', '<body><script>...</script>')],
      transformAsset: [(content, filePath) => {
        if (filePath.endsWith('.svg')) {
          // content is a buffer, you can turn it a string for utf-8 assets
          const svgContent = content.toString('utf-8');
          return /* transform the SVG */;
        }

        if (filePath.endsWith('.png')) {
          return /* transform the PNG */;
        }
      },
    }),
  ],
};
```

### Minification

The HTML plugin does not do any minification by default. You can use a transform function to use a minifier for your HTML or assets.

## Type definitions

```ts
import { OutputChunk, OutputOptions, OutputBundle } from 'rollup';

export interface InputHTMLOptions {
  /** The html source code. If set, overwrites path. */
  html?: string;
  /** Name of the HTML files when using the html option. */
  name?: string;
  /** Path to the HTML file, or glob to multiple HTML files. */
  path?: string;
}

export interface RollupPluginHTMLOptions {
  /** HTML file(s) to use as input. If not set, uses rollup input option. */
  input?: string | InputHTMLOptions | (string | InputHTMLOptions)[];
  /** Whether to preserve or flatten the directory structure of the HTML file. */
  flattenOutput?: boolean;
  /** Directory to resolve absolute paths relative to, and to use as base for non-flatted filename output. */
  rootDir?: string;
  /** Path to load modules and assets from at runtime. */
  publicPath?: string;
  /** Transform asset source before output. */
  transformAsset?: TransformAssetFunction | TransformAssetFunction[];
  /** Transform HTML file before output. */
  transformHtml?: TransformHtmlFunction | TransformHtmlFunction[];
  /** Whether to extract and bundle assets referenced in HTML. Defaults to true. */
  extractAssets?: boolean;
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

export interface TransformHtmlArgs {
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
  htmlFileName: string;
}

export type TransformHtmlFunction = (
  html: string,
  args: TransformHtmlArgs,
) => string | Promise<string>;

export type TransformAssetFunction = (
  filePath: string,
  content: Buffer,
) => string | Buffer | Promise<string | Buffer>;
```
