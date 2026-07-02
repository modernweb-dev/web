# @web/rollup-plugin-copy

## 1.0.0

### Major Changes

- 5260164: Drop support for Node.js 18 and 20, which have reached end-of-life. The minimum supported Node.js version is now 22.0.0.

### Patch Changes

- e268678: Fix the package export declaration to point TypeScript at the shipped `dist/copy.d.ts` declarations.

## 0.5.1

### Patch Changes

- b6d8bcf2: Update the `glob` dependency

## 0.5.0

### Minor Changes

- c185cbaa: Set minimum node version to 18

## 0.4.1

### Patch Changes

- 640ba85f: added types for main entry point

## 0.4.0

### Minor Changes

- febd9d9d: Set node 16 as the minimum version.

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
