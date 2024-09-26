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
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

export default {
  input: 'index.html',
  output: { dir: 'dist' },
  plugins: [html()],
};
```

### Multiple pages

If all pages share the same config, you can use a glob pattern to match multiple HTML files.

```js
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

export default {
  input: 'pages/*.html',
  output: { dir: 'dist' },
  plugins: [html()],
};
```

If your pages cannot be matched with a single glob you can set the input directly on HTML plugin.

```js
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

export default {
  output: { dir: 'dist' },
  plugins: [html({ input: ['index.html', 'static/page.html'] })],
};
```

If each input should be bundled with a different config, you can create multiple instances of the HTML plugin.

```js
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

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
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

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
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

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

The HTML plugin will bundle assets referenced from `img` and `link` and social media tag elements in your HTML. The assets are emitted as rollup assets, and the paths are updated to the rollup output paths.

By default rollup will hash the asset filenames, enabling long term caching. You can customize the filename pattern using the [assetFileNames option](https://rollupjs.org/guide/en/#outputassetfilenames) in your rollup config.

To turn off bundling assets completely, set the `extractAssets` option to false:

```js
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

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

#### Including assets referenced from css

If your css files reference other assets via `url`, like for example:

```css
body {
  background-image: url('images/star.gif');
}

/* or */
@font-face {
  src: url('fonts/font-bold.woff2') format('woff2');
  /* ...etc */
}
```

You can enable the `bundleAssetsFromCss` option:

```js
rollupPluginHTML({
  bundleAssetsFromCss: true,
  // ...etc
});
```

And those assets will get output to the `assets/` dir, and the source css file will get updated with the output locations of those assets, e.g.:

```css
body {
  background-image: url('assets/star-P4TYRBwL.gif');
}

/* or */
@font-face {
  src: url('assets/font-bold-f0mNRiTD.woff2') format('woff2');
  /* ...etc */
}
```

### Handling absolute paths

If your HTML file contains any absolute paths they will be resolved against the current working directory. You can set a different root directory in the config. Input paths will be resolved relative to this root directory as well.

```js
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

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
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

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
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

export default {
  input: 'index.html',
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

Set the minify option to do default HTML minification. If you need custom options, you can implement your own minifier using the `transformHtml` option.

```js
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

export default {
  input: 'index.html',
  output: { dir: 'dist' },
  plugins: [
    // add HTML plugin
    html({
      minify: true,
    }),
  ],
};
```

### Social Media Tags

Some social media tags require full absolute URLs (e.g. https://domain.com/guide/).
By providing an `absoluteBaseUrl` the plugin can make sure all appropriate URLs are processed.

```js
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

export default {
  input: 'index.html',
  output: { dir: 'dist' },
  plugins: [
    html({
      absoluteBaseUrl: 'https://domain.com',
    }),
  ],
};
```

The following tags will be processed:

```html
<!-- FROM -->
<meta property="og:image" content="./images/image-social.png" />
<link rel="canonical" href="/guides/" />
<meta property="og:url" content="/guides/" />

<!-- TO -->
<meta property="og:image" content="https://domain.com/assets/image-social-xxx.png" />
<link rel="canonical" href="https://domain.com/guides/" />
<meta property="og:url" content="https://domain.com/guides/" />
```

You can disable this behavior by removing the `absoluteBaseUrl` or setting `absoluteSocialMediaUrls` to false.

### Inject a Service Worker

In order to enable PWA support you can enable the injection of a service worker registration code block.<br>
Note: This does not create the service worker

```js
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';

export default {
  input: 'index.html',
  plugins: [
    html({
      injectServiceWorker: true,
      serviceWorkerPath: '/file/system/path/to/service-worker.js',
    }),
  ],
};
```

### Strict CSP for inline scripts

To prevent XSS, there is a rule in Content-Security-Policy guidelines called [script-src](https://content-security-policy.com/script-src/).

Some servers will (rightfully so) set this value to 'self', sometimes adding a whitelist of other origins e.g. for Google Analytics.
This makes it impossible for inline scripts to execute. There's an ugly way around that, by setting CSP rule `unsafe-inline`.

There's also a proper workaround, which is by either using hashes or a nonce to allow inline scripts to run.
Quite often, rollup plugins will insert inline scripts, e.g. to load polyfills, SystemJS or other common use cases.

In this plugin, you can pass the option `strictCSPInlineScripts` and set it to true.
The plugin will then scan HTML assets for inline scripts and turn its contents into a sha256 hash.
These hashes are then inserted in a CSP `meta` tag in the HTML asset, enabling these inline scripts to run even under strict CSP rules.

> Caveat: If you set CSP rules in your Response headers on the server end, this will override the CSP meta tag from the client.

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
  /** HTML file glob patterns or patterns to ignore */
  exclude?: string | string[];
  /** Whether to minify the output HTML. */
  minify?: boolean;
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
  /** Whether to ignore assets referenced in HTML and CSS with glob patterns. */
  externalAssets?: string | string[];
  /** Define a full absolute url to your site (e.g. https://domain.com) */
  absoluteBaseUrl?: string;
  /** Whether to set full absolute urls for ['meta[property=og:image]', 'link[rel=canonical]', 'meta[property=og:url]'] or not. Requires a absoluteBaseUrl to be set. Default to true. */
  absoluteSocialMediaUrls?: boolean;
  /** Should a service worker registration script be injected. Defaults to false. */
  injectServiceWorker?: boolean;
  /** File system path to the generated service worker file */
  serviceWorkerPath?: string;
  /** Prefix to strip from absolute paths when resolving assets and scripts, for example when using a base path that does not exist on disk. */
  absolutePathPrefix?: string;
  /** When set to true, will insert meta tags for CSP and add script-src values for inline scripts by sha256-hashing the contents */
  strictCSPInlineScripts?: boolean;
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
  content: Buffer,
  filePath: string,
) => string | Buffer | Promise<string | Buffer>;
```
