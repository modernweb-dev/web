import { expect } from '../chai.js';
import { importMockable } from '../../../browser/index.js';

const timeLibrary = await importMockable('time-library/hour');
const { getTimeOfDay } = await import('./fixture/getTimeOfDay.js');

let backup;
it('can run a module normally', () => {
  backup = timeLibrary.getCurrentHour;
  const timeOfDay = getTimeOfDay();
  expect(timeOfDay).to.equal('night');
});

it('can intercept a module', () => {
  timeLibrary.getCurrentHour = () => 12;
  const timeOfDay = getTimeOfDay();
  expect(timeOfDay).to.equal('day');
});

it('can restore an intercepted module', () => {
  timeLibrary.getCurrentHour = backup;
  const timeOfDay = getTimeOfDay();
  expect(timeOfDay).to.equal('night');
});
