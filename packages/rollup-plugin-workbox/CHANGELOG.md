# rollup-plugin-workbox

## 8.1.1

### Patch Changes

- f506af31: Upgrade esbuild to 0.24.x

## 8.1.0

### Minor Changes

- 8218a0a5: Update ESBuild to latest version

## 8.0.2

### Patch Changes

- 640ba85f: added types for main entry point

## 8.0.1

### Patch Changes

- 9ae9c2e7: fix: generate sw arg

## 8.0.0

### Major Changes

- f7927b81: feat: update workbox v7

  - Update workbox to v7
  - Removed the mode option in favour of just always bundling/removing process.env for the service worker when using injectManifest

### Patch Changes

- 85647c10: Update `lit-html`
- 5acaf838: Update `@typescript-eslint/parser`
- d56f6bb0: fix: esbuild options shouldnt override swsrc and swdest
- ab4720fa: fix: terser import

## 7.0.1

### Patch Changes

- 1109ec37: Replace `rollup-plugin-terser` with `@rollup/plugin-terser`

## 7.0.0

### Major Changes

- febd9d9d: Set node 16 as the minimum version.
- 72c63bc5: Require Rollup@v3.x and update all Rollup related dependencies to latest.

## 6.2.2

### Patch Changes

- f7ddc726: Revert back to non-ESM version of `pretty-bytes`

## 6.2.1

### Patch Changes

- 7b35551b: Update `pretty-bytes`
- 1113fa09: Update `@rollup/pluginutils`
- 817d674b: Update `browserslist-useragent`
- bd12ff9b: Update `rollup/plugin-replace`
- 8128ca53: Update @rollup/plugin-replace

## 6.2.0

### Minor Changes

- 641e0a9e: Update workbox-build dependency to 6.2.4

## 6.1.4

### Patch Changes

- eb2733de: Update dependency @rollup/plugin-replace to v3

## 6.1.3

### Patch Changes

- 687d4750: Downgrade @rollup/plugin-node-resolve to v11

## 6.1.2

### Patch Changes

- 9c97ea53: update dependency @rollup/plugin-node-resolve to v13

## 6.1.1

### Patch Changes

- 8cf22153: Remove "mode" from passed workbox config.

## 6.1.0

### Minor Changes

- 36f6ab39: update to node-resolve v11

## 6.0.0

### Major Changes

- 5da1505: upgrade workbox to v6

## 5.2.1

### Patch Changes

- 93a4243: Export cjs and esm correctly

## 5.2.0

### Minor Changes

- 1b045b9: Convert code base to TypeScript
