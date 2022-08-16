---
'@web/rollup-plugin-html': minor
---

Detect `<source src="*">` tags as assets which means videos get copied and hashed.

```html
<video controls>
  <source src="./my-video.mp4" type="video/mp4">
</video>
```
