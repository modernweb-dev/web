import { sendKeys } from '../../browser/commands.mjs';
import { expect } from '../chai.js';

it('sends keys to an input', async () => {
  const keys = 'abc123';
  const input = document.createElement('input');
  document.body.append(input);
  input.focus();

  await sendKeys({
    type: keys,
  });

  expect(input.value).to.equal(keys);
  input.remove();
});

it('natively presses `Tab`', async () => {
  const input1 = document.createElement('input');
  const input2 = document.createElement('input');
  document.body.append(input1, input2);
  input1.focus();
  expect(document.activeElement).to.equal(input1);

  await sendKeys({
    press: 'Tab',
  });

  expect(document.activeElement).to.equal(input2);
  input1.remove();
  input2.remove();
});
