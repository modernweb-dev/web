# @web/rollup-plugin-copy

## 0.3.0

### Minor Changes

- 7f9d853c: Added `exclude` option for rollup-plugin-copy.

  Example: Exclude single directory:

  ```js
  copy({ pattern: '**/*.svg', exclude: 'node_modules' });
  ```

  Example: Exclude multiple globs:

  ```js
  copy({ pattern: '**/*.svg', exclude: ['node_modules', 'src/graphics'] });
  ```

## 0.2.0

### Minor Changes

- b06a71b: adds copied files to watch list

## 0.1.2

### Patch Changes

- bde5be4: Also copy hidden "dot" files and folders

## 0.1.1

### Patch Changes

- 0876717: define exported types so users can consume them

## 0.1.0

### Minor Changes

- 08197ef: Initial version
