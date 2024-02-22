import { expect } from '../../../chai.js';
import sinon from 'sinon' 
import { importMockable } from '../../../../../browser/index.js';

const path = new URL(import.meta.resolve('../../fixture/src/flow/libs/time-library.js')).pathname;
const timeLibrary = await importMockable(path);
const { getTimeOfDay } = await import('../../fixture/src/flow/step/getTimeOfDay.js');

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

it('can have stub applied on intercepted module', () => {
  const stub = sinon.stub(timeLibrary, 'getCurrentHour').returns(15)
  const timeOfDay = getTimeOfDay();
  expect(timeOfDay).to.equal('day');
  expect(stub.calledOnce).to.be.true;
});