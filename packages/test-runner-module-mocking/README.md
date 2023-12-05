# Web Test Runner Module Mocking

Web Test Runner package that enables mocking of ES Modules during test runs.

## Concept

A typical step when authoring tests is to change the behavior of dependencies of a system under test. This is usually needed to cover all branches of the system under test, for performance reasons or sometimes because a dependency cannot operate correctly in the test environment. Test authors will use mocks, stubs or spies to change or monitor the original implementation.

Dependencies that are on the global window object are easy to change. ES Modules, however, and specifically their exports bindings cannot be reassigned. This package exposes a Web Test Runner plugin that can intercept module imports on the server. When a module is intercepted, the plugins injects extra code that allows reassigning its exports.

Once the plugin is active in the Web Test Runner config, a test author can use the `importMockable()` function to start rewiring modules in test runs. The function imports the intercepted module and returns a mockable object. This objects contains all the exports of the module as its properties. Reassigning these properties allows rewiring the intercepted module, and the system under test will use the updated implementation.

```js
import { importMockable } from '@web/test-runner-module-mocking';

const externalLibrary = await importMockable('external-library');

// Return the original function that 'external-library' exposed in the `externalFunction` named export
externalLibrary.externalFunction; // f externalFunction() { ... }

// Rewire the 'external-library' module to return this anonymous function as the `externalFunction` export
externalLibrary.externalFunction = () => console.log('hello world'); // () => console.log('hello world')

const { externalFunction } = await import('external-library');
externalFunction; // () => console.log('hello world')
```

## Usage

### Setup

```js
// web-test-runner.config.mjs
import { moduleMockingPlugin } from '@web/test-runner-module-mocking/plugin.js';

export default {
  plugins: [moduleMockingPlugin()],
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
import { importMockable } from '@web/test-runner-module-mocking';

const timeLibrary = await importMockable('time-library');
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

This scenario showcases how to use `@web/test-runner-module-mocking` together with `chai` and `sinon`.

```js
// test/getTimeOfDay.test.js
import { stub } from 'sinon';
import { expect } from 'chai';
import { importMockable } from '@web/test-runner-module-mocking';

const timeLibrary = await importMockable('time-library');
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

## Caveats

When designing the approach to allow modules to be mockable, a number of alternatives were considered:

- [Import Attributes](https://github.com/tc39/proposal-import-attributes)  
  eg. `import externalLibrary from "external-library" with { type: "module-mockable" };`  
  This alternative was dismissed because Import Attributes is not yet widely implemented. This could be reconsidered in a future iteration.
- Custom URL scheme  
  eg. `import externalLibrary from "module-mockable:external-library"`  
  This alternative was dismissed as the use of a unknown specifier was deemed magic.

In the end a combination of an async function (using an internal dynamic `import()`) and a top-level await was chosen. This choice, however, has a number of caveats.

### Order of imports

In order to intercept a module, the module should not be referenced yet. (Once a module is loaded, the module loader also loads all its dependent modules) This means the module containing the system under test should be loaded _after_ the module interception. As interception is achieved using a function, this also means the system under test should _always_ be loaded using a dynamic import in order to be done after the interception.

```js
import { importMockable } from '@web/test-runner-module-mocking';

// First, intercept
const externalLibrary = await importMockable('external-library');

// Second, load the system under test
const systemUnderTest = await import('../../src/system-under-test.js');

// Run tests
...
```

### Types of module specifiers

Currently, two types of module specifiers are supported: bare modules and server relative modules.

```javascript
// bare module, located in `node_modules`
await importMockable('external-library');

// server relative module
await importMockable('/src/library-to-intercept.js');
```

In order to use regular relative references, `import.meta.resolve()` and `new URL().pathname` can be used.

```javascript
// relative module
await importMockable(new URL(import.meta.resolve('../src/library-to-intercept.js')).pathname);
```
