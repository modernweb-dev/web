# @web/rollup-plugin-html

## 2.3.0

### Minor Changes

- 6207e413: glob patterns exclusion for external assets

## 2.2.1

### Patch Changes

- a1f09793: fix: output assets locations

## 2.2.0

### Minor Changes

- c3dc21aa: feat(rollup-plugin-html): resolves assets in styles

## 2.1.2

### Patch Changes

- 1c0088de: Update Rollup to version 4.

## 2.1.1

### Patch Changes

- b6d8bcf2: Update the `glob` dependency

## 2.1.0

### Minor Changes

- c185cbaa: Set minimum node version to 18

### Patch Changes

- Updated dependencies [c185cbaa]
  - @web/parse5-utils@2.1.0

## 2.0.1

### Patch Changes

- f6ba53f0: Export types with package

## 2.0.0

### Major Changes

- febd9d9d: Set node 16 as the minimum version.
- 72c63bc5: Require Rollup@v3.x and update all Rollup related dependencies to latest.

### Patch Changes

- Updated dependencies [febd9d9d]
  - @web/parse5-utils@2.0.0

## 1.11.1

### Patch Changes

- 18a16bb0: Update `html-minifier-terser`
- Updated dependencies [18a16bb0]
  - @web/parse5-utils@1.3.1

## 1.11.0

### Minor Changes

- ab5295e9: Detect `<source src="*">` tags as assets which means videos get copied and hashed.

  ```html
  <video controls>
    <source src="./my-video.mp4" type="video/mp4" />
  </video>
  ```

## 1.10.3

### Patch Changes

- e9508a24: fix: support node 17 & 18 by using md5 hashing

## 1.10.2

### Patch Changes

- d1c2ff91: fix(rollup-plugin-html): dont pass index.html to rollup input

## 1.10.1

### Patch Changes

- 516ecd3f: Fix html-minimier-terser call to use await

## 1.10.0

### Minor Changes

- b57f36de: Update dependency html-minifier-terser to 6.0.0

## 1.9.1

### Patch Changes

- ca749b0e: Update dependency @types/parse5 to v6
- Updated dependencies [ca749b0e]
  - @web/parse5-utils@1.3.0

## 1.9.0

### Minor Changes

- 075afcf9: Add `exclude` option. Used e.g. to ignore html file assets when bundling.

## 1.8.0

### Minor Changes

- 7c4dd6cd: Support `picture` tags by handling `source` tags with `srcset` attributes.

  Example of supported html

  ```html
  <picture>
    <source type="image/avif" srcset="small.avif 30w, big.avif 60w" sizes="30px" />
    <source type="image/jpeg" srcset="small.jpeg 30w, big.jpeg 60w" sizes="30px" />
    <img alt="..." src="small.jpeg" width="30" height="15" loading="lazy" decoding="async" />
  </picture>
  ```

## 1.7.0

### Minor Changes

- be919633: add minify option

### Patch Changes

- e331e429: fix(rollup-plugin-html): fix linked assets not being prefixed with configured publicPath. See https://github.com/modernweb-dev/web/issues/1302

## 1.6.0

### Minor Changes

- 7d0e28c2: Preserve attributes on html script tags.

  Input:

  ```html
  <script type="module" src="..." some="attribute">
  ```

  Output before:

  ```html
  <script type="module" src="...">
  ```

  Output now:

  ```html
  <script type="module" src="..." some="attribute">
  ```

## 1.5.0

### Minor Changes

- 5688eb5b: Add option to scan for inline scripts in HTML assets, and insert a CSP meta tag to allow them executing with strict CSP rules.

### Patch Changes

- Updated dependencies [a07f4aef]
  - @web/parse5-utils@1.2.2

## 1.4.0

### Minor Changes

- 58d78c33: Add option `absolutePathPrefix` to support subfolders deployments if absolute urls are used

## 1.3.3

### Patch Changes

- 1f4a2ab3: Adds an `injectServiceWorker` and `serviceWorkerPath` option which if provided will inject a service worker registration script into html files.

## 1.3.2

### Patch Changes

- 05dd36f: fix entryoint for node v10

## 1.3.1

### Patch Changes

- 53ba8db: ignore scripts with absolute paths

## 1.3.0

### Minor Changes

- ac2e832: Allow for an `absoluteBaseUrl` setting which will convert absolute URLs to full absolute URLs for the following tags.

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

### Patch Changes

- de5d396: Identify `<meta property="og:image"` as an asset

## 1.2.1

### Patch Changes

- cfdeb98: - do not touch `<script>` tags with inline content/code
  - treat `<script src="...">` tags as assets

## 1.2.0

### Minor Changes

- 23fadf2: allow disabling default inject behavior

### Patch Changes

- Updated dependencies [a7c9af6]
  - @web/parse5-utils@1.1.2

## 1.1.1

### Patch Changes

- d804089: don't hash social media and browser assets
- 717c415: Prevent remote URLs from counting as assets
- 9e18d84: write asset paths relative to HTML file

## 1.1.0

### Minor Changes

- 50ba2d6: watch referenced assets

## 1.0.2

### Patch Changes

- d130352: bundle referenced HTML assets

## 1.0.1

### Patch Changes

- 12da341: remove prepublish script

## 1.0.0

### Major Changes

- 3121966: First release

### Patch Changes

- Updated dependencies [3121966]
  - @web/parse5-utils@1.1.0
