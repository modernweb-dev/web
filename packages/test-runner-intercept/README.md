## Usage

Setup

```js
// web-test-runner.config.mjs
import { interceptModulePlugin } from '@web/test-runner-intercept/plugin';

export default {
  plugins: [interceptModulePlugin()],
};
```

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

Simple test scenario:

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

More extended test scenario with common helper libraries:

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
