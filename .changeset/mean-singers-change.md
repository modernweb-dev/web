---
"@web/test-runner-commands": patch
"@web/test-runner": patch
---

Add a11ySnapshotPlugin to acquire the current accessibility tree from the browser:

```js
import { a11ySnapshot, findAccessibilityNode } from '@web/test-runner-commands';

// ...

const nodeName = 'Label Text';
const snapshot = await a11ySnapshot();
const foundNode = findAccessibilityNode(
    snapshot,
    (node) => node.name === nodeName
);
expect(foundNode).to.not.be.null;
```
