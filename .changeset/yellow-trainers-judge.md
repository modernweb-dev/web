---
'@web/rollup-plugin-html': minor
---

Support `picture` tags by handling `source` tags with `srcset` attributes.

Example of supported html

```html
<picture>
  <source type="image/avif" srcset="small.avif 30w, big.avif 60w" sizes="30px" />
  <source type="image/jpeg" srcset="small.jpeg 30w, big.jpeg 60w" sizes="30px" />
  <img alt="..." src="small.jpeg" width="30" height="15" loading="lazy" decoding="async" />
</picture>
```
