# Building >> Rollup Plugin HTML || 20

> This package is still shipped via the `@open-wc` npm namespace but will soon be switch to `@web`

Plugin for generating HTML files from rollup.

- Generate one or more HTML pages from a rollup build
- Inject rollup bundle into an HTML page
- Optionally use HTML as rollup input, bundling any module scripts inside
- Optionally use multiple html files via a glob or html strings as input
- Minify HTML and inline JS and CSS
- Suitable for single page and multi-page apps

## Installation

```bash
npm i -D @open-wc/rollup-plugin-html
```

## Simple HTML page

When used without any options, the plugin will inject your rollup bundle into a basic HTML page. Useful for developing a simple application.

<details>

<summary>Show example</summary>

```js
import html from '@open-wc/rollup-plugin-html';
export default {
  input: './my-app.js',
  output: { dir: 'dist' },
  plugins: [html()],
};
```

</details>

## Input from html file

During development, you will probably already have an HTML file which imports your application's modules. You can use this same file as the input of the html plugin, which will bundle any modules inside and output the same HTML minified optimized.

To do this, you can set the html file as input for rollup:

<details>

<summary>Show example</summary>

```js
import html from '@open-wc/rollup-plugin-html';
export default {
  input: 'index.html',
  output: { dir: 'dist' },
  plugins: [html()],
};
```

</details>

## Input from multiple html files

You can also work with multiple html files. An example of this could be when you're using this plugin in combination with a static site generator. To target all your html files, you can provide a glob as input. You can specify the `flatten: false` property to retain the folder structure.

<details>

<summary>Show example</summary>

```js
import html from '@open-wc/rollup-plugin-html';
export default {
  input: '**/*.html',
  // or
  input: ['index.html', 'pages/*.html'],
  output: { dir: 'dist' },
  plugins: [html({ flatten: false, rootDir: '_site' })],
};
```

</details>

You can also set the `files` property on the html plugin. This will take precedence over rollup's input.
Additionally, it supports an array of files/globs and can be used if you want to use multiple html plugins with different options:

<details>

<summary>Show example</summary>

```js
import html from '@open-wc/rollup-plugin-html';
export default {
  output: { dir: 'dist' },
  plugins: [
    html({
      files: ['index.html', 'docs/**/*.html'],
    }),
    html({
      files: 'pages/index.html',
      /* different options */
    }),
  ],
};
```

</details>

## Input from string

Sometimes the HTML you want to use as input is not available on the file system. With the `html` option you can provide the HTML as a string directly. This is useful for example when using rollup from javascript directly.

<details>

<summary>Show example</summary>

```js
import html from '@open-wc/rollup-plugin-html';
export default {
  output: { dir: 'dist' },
  plugins: [
    html({
      html: '<html><script type="module" src="./app.js"></script></html>',
    }),
  ],
};
```

</details>

## Input from multiple html strings

When creating multiple html files via strings the following additional options are required.

- `name`: name of your html file (incl. relative folders)
- `html`: the html as a string

<details>

<summary>Show example</summary>

```js
import html from '@open-wc/rollup-plugin-html';
export default {
  output: { dir: 'dist' },
  plugins: [
    html({
      rootDir: __dirname,
      html: [
        { name: 'index.html', html: '<html>...</html>' },
        {
          name: 'pages/page-a.html',
          html: '<html>...</html>',
        },
        {
          name: 'pages/page-b.html',
          html: '<html>...</html>',
        },
      ],
    }),
  ],
};
```

</details>

## Template

With the `template` option, you can let the plugin know where to inject the rollup build into. This option can be a string or an (async) function which returns a string.

<details>

<summary>Show example</summary>

Template as a string:

```js
import html from '@open-wc/rollup-plugin-html';
export default {
  output: { dir: 'dist' },
  plugins: [
    html({
      template: `
      <html>
        <head><title>My app</title></head>
        <body></body>
      </html>`,
    }),
  ],
};
```

Template as a function:

```js
import fs from 'fs';
import html from '@open-wc/rollup-plugin-html';

export default {
  output: { dir: 'dist' },
  plugins: [
    html({
      template() {
        return new Promise((resolve) => {
          const indexPath = path.join(__dirname, 'index.html');
          fs.readFile(indexPath, 'utf-8', (err, data) => {
            resolve(data);
          });
        });
      }
    }
  ],
};
```

</details>

## Manually inject build output

If you want to control how the build output is injected on the page, disable the `inject` option, and use the arguments provided to the template function.

<details>

<summary>Show example</summary>

With a regular template function:

```js
import html from '@open-wc/rollup-plugin-html';
export default {
  input: './app.js',
  output: { dir: 'dist' },
  plugins: [
    html({
      name: 'index.html',
      inject: false,
      template({ bundle }) {
        return `
        <html>
          <head>
            ${bundle.entrypoints.map(bundle => e =>
              `<script type="module" src="${e.importPath}"></script>`,
            )}
          </head>
        </html>
      `;
      },
    }),
  ],
};
```

When one of the input options is used, the input html is available in the template function. You can use this to inject the bundle into your existing HTML page:

```js
import html from '@open-wc/rollup-plugin-html';
export default {
  input: './app.js',
  output: { dir: 'dist' },
  plugins: [
    html({
      files: './index.html',
      inject: false,
      template({ inputHtml, bundle }) {
        return inputHtml.replace(
          '</body>',
          `<script type="module" src="${bundle[0].entrypoints[0].importPath}"></script></body>`,
        );
      },
    }),
  ],
};
```

</details>

## Transform output HTML

You can use the `transform` option to manipulate the output HTML before it's written to disk. This is useful for setting meta tags or environment variables based on input from other sources.

`transform` can be a single function or an array. This makes it easy to compose transformations.

<details>
  <summary>View example</summary>

Inject language attribute:

```js
import html from '@open-wc/rollup-plugin-html';
export default {
  output: { dir: 'dist' },
  plugins: [
    html({
      files: './index.html',
      transform: html => html.replace('<html>', '<html lang="en-GB">'),
    }),
  ],
};
```

Inject language attributes and environment variables:

```js
import html from '@open-wc/rollup-plugin-html';
import packageJson from './package.json';

const watchMode = process.env.ROLLUP_WATCH === 'true';

export default {
  output: { dir: 'dist' },
  plugins: [
    html({
      files: './index.html',
      transform: [
        html => html.replace('<html>', '<html lang="en-GB">'),
        html =>
          html.replace(
            '<head>',
            `<head>
              <script>
                window.ENVIRONMENT = "${watchMode ? 'DEVELOPMENT' : 'PRODUCTION'}";
                window.APP_VERSION = "${packageJson.version}";
              </script>`,
          ),
      ],
    }),
  ],
};
```

</details>

## Public path

By default, all imports are made relative to the HTML file and expect files to be in the rollup output directory. With the `publicPath` option you can modify where files from the HTML file are requested from.

<details>
  <summary>View example</summary>

```js
import html from '@open-wc/rollup-plugin-html';

export default {
  output: { dir: 'dist' },
  plugins: [
    html({
      files: './index.html',
      publicPath: '/static/',
    }),
  ],
};
```

</details>

## Multiple build outputs

It is possible to create multiple rollup build outputs and inject both bundles into the same HTML file. This way you can ship multiple bundles to your users, and load the most optimal version for the user's browser.

<details>
<summary>View example</summary>

When you configure rollup to generate multiple build outputs you can inject all outputs into a single HTML file.

To do this, create one parent `@open-wc/rollup-plugin-html` instance and use `addOutput` to create two child plugins for each separate rollup output.

Each output defines a unique name, this can be used to retrieve the correct bundle from `bundles` argument when creating the HTML template.

```js
import html from '@open-wc/rollup-plugin-html';

const htmlPlugin = html({
  name: 'index.html',
  inject: false,
  template({ bundles }) {
    return `
      <html>
        <body>
        ${bundles.modern.entrypoints.map(
          e => `<script type="module" src="${e.importPath}"></script>`,
        )}

        <script nomodule src="./systemjs.js"></script>
        ${bundles.legacy.entrypoints.map(
          e => `<script nomodule>System.import("${e.importPath}")</script>`,
        )}
        </body>
      </html>
    `;
  },
});

export default {
  input: './app.js',
  output: [
    {
      format: 'es',
      dir: 'dist',
      plugins: [htmlPlugin.addOutput('modern')],
    },
    {
      format: 'system',
      dir: 'dist',
      plugins: [htmlPlugin.addOutput('legacy')],
    },
  ],
  plugins: [htmlPlugin],
};
```

</details>

If your outputs use different outputs directories, you need to set the `outputBundleName` option to specify which build to use to output the HTML file.

<details>
<summary>View example</summary>

```js
import html from '@open-wc/rollup-plugin-html';

const htmlPlugin = html({
  name: 'index.html',
  inject: false,
  outputBundleName: 'modern',
  template({ bundles }) {
    return `
      ...
    `;
  },
});

export default {
  input: './app.js',
  output: [
    {
      format: 'es',
      dir: 'dist',
      plugins: [htmlPlugin.addOutput('modern')],
    },
    {
      format: 'system',
      dir: 'dist',
      plugins: [htmlPlugin.addOutput('legacy')],
    },
  ],
  plugins: [htmlPlugin],
};
```

</details>

## Details for Plugin rootDir

When keeping the folder structures it may mean that your `rootDir` is not your current working directory.
For example, imagine all the html files are generated into a `_site-in-html` folder.

```
.
├── _site-in-html
│   ├── page-a
│   │   └── index.html
│   └── index.html
├── rollup.config.js
└── package.json
```

If you provide `input: '_site-in-html/**/*.html';` it will result in files like `dist/_site-in-html/index.html`. If the dist folder gets automatically uploaded to a static hosting service then it will result in this url `https://my-domain.com/_site_in-html/index.html`.
By defining `rootDir: './_site-in-html'` and `input: '**/*.html';` we can get files like `dist/index.html` and urls like `https://my-domain.com/`.

<details>

<summary>Show example</summary>

```js
import html from '@open-wc/rollup-plugin-html';
export default {
  input: '**/*.html',
  output: { dir: 'dist' },
  plugins: [html({ flatten: false, rootDir: './_site-in-html' })],
};
```

</details>

## Configuration options

All configuration options are optional if an option is not set the plugin will fall back to smart defaults. See below example use cases.

### name

Type: `string`

Name of the generated HTML file. If `files` is set, defaults to the `files` filename, otherwise defaults to `index.html`.

### files

Type: `string|strings[]`

Paths to the HTML file to use as input. Modules in this files are bundled and the HTML is used as the template for the generated HTML file. This may also be a glob pattern.

### rootDir

Type: `string`

Path to a directory which will serve as the starting point for all `files`. The final file tree will result in relative urls to this rootDir.

### flatten

Type: `boolean`

Whether or not the folder in `filePaths` should be stripped, and all files should be placed in a single folder. (Defaults to true)

### html

Type: `string|[{ name: string, html: string}]`

Provide the HTML directly as string. If multiple files are provided then name and html are required.

### outputBundleName

Type: `string`

When using multiple build outputs, this is the name of the build that will be used to emit the generated HTML file.

### dir

Type: `string`

The directory to output the HTML file into. This defaults to the main output directory of your rollup build. If your build has multiple outputs in different directories, this defaults to the lowest directory on the file system.

### publicPath

Type: `string`

The public path where static resources are hosted. Any file requests (CSS, js, etc.) from the index.html will be prefixed with the public path.

### inject

Type: `boolean`

Whether to inject the rollup bundle into the output HTML. If using one of the input options, only the bundled modules in the HTML file are injected. Otherwise, all rollup bundles are injected. Default true. Set this to false if you need to apply some custom logic to how the bundle is injected.

### minify

Type: `boolean | object | (html: string) => string | Promise<string>`

When false, it does not do any minification. When true, does minification with default settings. When an object, does minification with a custom config. When a function, the function is called with the html and should return the minified html. Defaults to true.

Default minification is done using [html-minifier](https://github.com/kangax/html-minifier). When passing an object, the object is given to `html-minifier` directly so you can use any of the regular minify options.

### template

Type: `string | (args: TemplateArgs) => string | Promise<string>`

Template to inject js bundle into. It can be a string or an (async) function. If an input is set, that is used as the default output template. Otherwise defaults to a simple html file.

For more info see the [configuration type definitions](#configuration-types).

### transform

Type: `TransformFunction | TransformFunction[]`

TransformFunction: `(html: string, args: TransformArgs) => string | Promise<string>`

Function or array of functions that transform the final HTML output.

For more info see the [configuration type definitions](#configuration-types).

## Configuration types

<details>

<summary>Full typescript definitions of configuration options</summary>

```ts
import { OutputChunk, OutputOptions, OutputBundle, Plugin } from 'rollup';

export interface HtmlFile {
  html?: string;
  name?: string;
  rootDir?: string;
  inputModuleIds?: string[];
  htmlFileName?: string;
  inlineModules?: Map<string, string>;
}

export interface PluginOptions {
  name?: string;
  files?: string | string[];
  flatten?: boolean;
  html?: string | HtmlFile[];
  outputBundleName?: string;
  rootDir?: string;
  publicPath?: string;
  inject?: boolean;
  minify?: boolean | object | MinifyFunction;
  template?: string | TemplateFunction;
  transform?: TransformFunction | TransformFunction[];
}

export type MinifyFunction = (html: string) => string | Promise<string>;

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

export interface TemplateArgs {
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
  // see TemplateArgs
  bundle: EntrypointBundle;
  // see TemplateArgs
  bundles: Record<string, EntrypointBundle>;
}

export type TransformFunction = (html: string, args: TransformArgs) => string | Promise<string>;

export type TemplateFunction = (args: TemplateArgs) => string | Promise<string>;

export interface RollupPluginHtml extends Plugin {
  /** @deprecated use getHtmlFileNames instead */
  getHtmlFileName(): string | undefined;
  getHtmlFileNames(): string[] | undefined;
  addHtmlTransformer(transform: TransformFunction): void;
  addOutput(name: string): Plugin;
}
```

</details>
