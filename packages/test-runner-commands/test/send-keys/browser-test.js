import { sendKeys } from '../../browser/commands.mjs';
import { expect } from '../chai.js';

it('natively types into an input', async () => {
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

it('natively presses `Shift+Tab`', async () => {
  const input1 = document.createElement('input');
  const input2 = document.createElement('input');
  document.body.append(input1, input2);
  input2.focus();
  expect(document.activeElement).to.equal(input2);

  await sendKeys({
    down: 'Shift',
  });
  await sendKeys({
    press: 'Tab',
  });
  await sendKeys({
    up: 'Shift',
  });

  expect(document.activeElement).to.equal(input1);
  input1.remove();
  input2.remove();
});

it('natively holds and then releases a key', async () => {
  const input = document.createElement('input');
  document.body.append(input);
  input.focus();

  await sendKeys({
    down: 'Shift',
  });
  // Note that pressed modifier keys are only respected when using `press` or
  // `down`, and only when using the `Key...` variants.
  await sendKeys({
    press: 'KeyA',
  });
  await sendKeys({
    press: 'KeyB',
  });
  await sendKeys({
    press: 'KeyC',
  });
  await sendKeys({
    up: 'Shift',
  });
  await sendKeys({
    press: 'KeyA',
  });
  await sendKeys({
    press: 'KeyB',
  });
  await sendKeys({
    press: 'KeyC',
  });

  expect(input.value).to.equal('ABCabc');
  input.remove();
});
