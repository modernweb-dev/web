---
'@web/rollup-plugin-html': minor
---

Allow for an `absoluteBaseUrl` setting which will convert absolute URLs to full absolute URLs for the following tags.

```html
<!-- FROM -->
<meta property="og:image" content="./images/image-social.png">
<link rel="canonical" href="/guides/">
<meta property="og:url" content="/guides/">

<!-- TO -->
<meta property="og:image" content="https://domain.com/assets/image-social-xxx.png">
<link rel="canonical" href="https://domain.com/guides/">
<meta property="og:url" content="https://domain.com/guides/">
```
