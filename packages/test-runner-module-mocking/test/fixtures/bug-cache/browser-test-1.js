import { expect } from '../chai.js';

// this module gets improted here first and gets cached by the dev server
// resulting in `import { getCurrentHour } from './time-library.js';` being cached too
// the following test intercepts "time-library.js", but that has no impact on the cached "getTimeOfDay.js"
// so the mocking won't work for any module we need to intercept inside "getTimeOfDay.js" in any following test
import { getTimeOfDay } from './fixture/getTimeOfDay.js';

describe('1st test', () => {
  it('works', () => {
    const timeOfDay = getTimeOfDay();
    expect(typeof timeOfDay === 'string').to.equal(true);
  });
});
