# Building >> Rollup Plugin Copy ||40

A Rollup plugin which copies asset files while retaining the relative folder structure.

## Installation

```
npm install --save-dev @web/rollup-plugin-copy
```

## Usage

Create a `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) and import the plugin:

```js
import { copy } from '@web/rollup-plugin-copy';

export default {
  input: 'src/index.js',
  output: {
    dir: 'output',
    format: 'es',
  },
  plugins: [copy({ patterns: '**/*.{svg,jpg,json}' })],
};
```

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

## Options

### `patterns`

Type: `string|string[]`<br>
Mandatory: true

Does accept a string pattern or an array of strings patterns.

### `rootDir`

Type: `string`<br>
Default: current working directory

Patterns are relative to this directory and all found files will be resolved relative to it.
If files can not be found `path.resolve('./my/path)` may be used to ensure a full path.

### `exclude`

Type: `string|string[]`
Default: `undefined`

A glob or array of globs to exclude from copying.

## Examples

Source directory

```
.
├── sub
│   ├── sub-a.svg
│   └── sub-b.txt
├── a.svg
└── b.svg
```

### Pattern all svgs

Searching for all nested svgs.

```js
copy({ patterns: '**/*.svg' });
```

Result:

```
.
├── sub
│   └── sub-a.svg
├── a.svg
└── b.svg
```

### Pattern all svgs different root

Changing the root to the sub folder means files will only be searched in there and all files will be relative to it.

```js
copy({ patterns: '**/*.svg', rootDir: './sub' });
```

Result:

```
.
└── sub-a.svg
```

### Exclude single directory

```js
copy({ pattern: '**/*.svg', exclude: 'node_modules' });
```

Source directory

```
.
├── node_modules
│   ├── many modules...
├── sub
│   ├── sub-a.svg
│   └── sub-b.txt
├── a.svg
└── b.svg
```

Result:

```
.
├── sub
│   └── sub-a.svg
├── a.svg
└── b.svg
```

### Exclude multiple globs

Source directory

```
.
├── node_modules
│   ├── many modules...
├── src
│   └── graphics
│     └── a-unoptimized.svg
├── sub
│   ├── sub-a.svg
│   └── sub-b.txt
├── a.svg
└── b.svg
```

Result:

```
.
├── sub
│   └── sub-a.svg
├── a.svg
└── b.svg
```

```js
copy({ pattern: '**/*.svg', exclude: ['node_modules', 'src/graphics'] });
```
