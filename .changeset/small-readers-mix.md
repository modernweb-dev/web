---
'@web/rollup-plugin-html': patch
---

- do not touch `<script>` tags with inline content/code
- treat `<script src="...">` tags as assets
