---
'@web/rollup-plugin-html': minor
---

Preserve attributes on html script tags.

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
