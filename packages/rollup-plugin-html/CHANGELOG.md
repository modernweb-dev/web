# @web/rollup-plugin-html

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
