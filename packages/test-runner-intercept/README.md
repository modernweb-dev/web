# Web Test Runner Intercept

Web test runner plugin that allows the interception of modules during test runs. Often, while creating tests, there is the need to change the behavior of a dependency of the system under test. This is needed to cover all branches of the system under test, for performance reasons or sometimes because the dependency cannot operate correctly in the test environment. Dependencies that are on the global window object are easy to change with a mock or a stub. ES Modules, however, and specifically their exports cannot be altered. This plugin introduces a hook that enables the interception of modules and allows altering its exports.

## Concept

Next to a web test runner plugin that enables module interception, this package also exposes a function `interceptModule()` to be used in the test run. This function allows to define what module needs to be intercepted and returns an object with all the exports of the module as its properties. Changing these properties allows to rewire the intercepted module without changing the system under test.

```js
import { interceptModule } from '@web/test-runner-intercept';

const externalLibrary = await interceptModule('external-library');

// Return the original function that 'external-library' exposed in the `externalFunction` named export
externalLibrary.externalFunction; // f externalFunction() { ... }

// Rewire the 'external-library' module to return this anonymous function as the `externalFunction` export
externalLibrary.externalFunction = () => console.log('hello world'); // () => console.log('hello world')

const { externalFunction } = await import('external-library');
externalFunction; // () => console.log('hello world')
```

### Caveats

#### Order of imports

In order to intercept a module, the module should not be referenced yet. (Once a module is loaded, the module loader also loads all its dependent modules) This means the module containing the system under test should be loaded _after_ the module interception. As interception is achieved using a function, this also means the system under test should _always_ be loaded using a dynamic import in order to be done after the interception.

```js
import { interceptModule } from '@web/test-runner-intercept';

// First, intercept
const externalLibrary = await interceptModule('external-library');

// Second, load the system under test.
const systemUnderTest = await import('../../src/system-under-test.js');

// Run tests
...
```

#### Types of module specifiers

Currently, two types of module specifiers are supported: bare modules and server relative modules.

```javascript
// bare module, located in `node_modules`
await interceptModule('external-library');

// server relative module
await interceptModule('/src/library-to-intercept.js');
```

In order to use regular relative references, `import.meta.resolve()` and `new URL().pathname` can be used.

```javascript
// relative module
await interceptModule(new URL(import.meta.resolve('../src/library-to-intercept.js')).pathname);
```

## Usage

### Setup

```js
// web-test-runner.config.mjs
import { interceptModulePlugin } from '@web/test-runner-intercept/plugin';

export default {
  plugins: [interceptModulePlugin()],
};
```

### Simple test scenario

```js
// src/getTimeOfDay.js
import { getCurrentHour } from 'time-library';

export function getTimeOfDay() {
  const hour = getCurrentHour();
  if (hour < 6 || hour > 18) {
    return 'night';
  }
  return 'day';
}
```

```js
// test/getTimeOfDay.test.js
import { interceptModule } from '@web/test-runner-intercept';

const timeLibrary = await interceptModule('time-library');
const { getTimeOfDay } = await import('../src/getTimeOfDay.js');

describe('getTimeOfDay', () => {
    it('returns night at 2', () => {
        timeLibrary.getCurrentHour = () => 2;
        const result = getTimeOfDay();
        if (result !== 'night') {
            throw;
        }
    });
});
```

### Extended test scenario

This scenario showcases how to use `@web/test-runner-intercept` together with `chai` and `sinon`.

```js
// test/getTimeOfDay.test.js
import { stub } from 'sinon';
import { expect } from 'chai';
import { interceptModule } from '@web/test-runner-intercept';

const timeLibrary = await interceptModule('time-library');
const { getTimeOfDay } = await import('../src/getTimeOfDay.js');

describe('getTimeOfDay', () => {
  it('returns night at 2', () => {
    const stubGetCurrentHour = stub(timeLibrary, 'getCurrentHour').returns(2);
    try {
      const result = getTimeOfDay();
      expect(result).to.equal('night');
    } finally {
      stubGetCurrentHour.restore();
    }
  });
  it('returns day at 14', () => {
    const stubGetCurrentHour = stub(timeLibrary, 'getCurrentHour').returns(14);
    try {
      const result = getTimeOfDay();
      expect(result).to.equal('day');
    } finally {
      stubGetCurrentHour.restore();
    }
  });
});
```
