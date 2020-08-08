---
title: Helper Libraries
eleventyNavigation:
  key: Helper Libraries
  parent: Writing tests
  order: 1
---

[@open-wc/testing](https://open-wc.org/testing/testing.html) is a general-purpose library, including assertions via chai, HTML test fixtures, a11y tests, and test helpers.

It is an opinionated implementation that brings together multiple libraries. You could also use the individual libraries together:

- [@bundled-es-modules/chai](https://www.npmjs.com/package/@bundled-es-modules/chai)
- [@open-wc/testing-helpers](https://www.npmjs.com/package/@open-wc/testing-helpers)
- [@open-wc/chai-dom-equals](https://www.npmjs.com/package/@open-wc/chai-dom-equals)
- [chai-a11y-axe](https://www.npmjs.com/package/chai-a11y-axe)

For stubbing and mocking, we recommend [sinon](https://www.npmjs.com/package/sinon) which ships an es module variant out of the box:

```js
import { stub, useFakeTimers } from 'sinon';
```
