# Web Test Runner Intercept

Web test runner plugin that allows the interception of modules during test runs. Often, while creating tests, there is the need to change the behavior of a dependency of the code under test. This is needed to cover all branches of the code under test, for performance reasons or sometimes because the dependency cannot operate correctly in the test environment. Dependencies that are on the global window object are easy to change with a mock or a stub. ES Modules, however, and specifically their exports cannot be altered. This plugin introduces a hook that enables the interception of modules and allows altering its exports.

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
