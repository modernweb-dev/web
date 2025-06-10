import { selectOption } from '../../browser/commands.mjs';
import { expect } from '../chai.js';

const selectTemplate = `<select id="testSelect">
  <option value="first">first option</option>
  <option value="second">second option</option>
  <option value="third">third option</option>
</select>`;

it('natively selects an option by value', async () => {
  const valueToSelect = 'first';
  document.body.innerHTML = selectTemplate;
  const select = document.querySelector('#testSelect');
  await selectOption({ selector: '#testSelect', value: valueToSelect });

  expect(select.value).to.equal(valueToSelect);
});

it('natively selects an option by label', async () => {
  const labelToSelect = 'second option';
  document.body.innerHTML = selectTemplate;

  const select = document.querySelector('#testSelect');
  await selectOption({ selector: '#testSelect', label: labelToSelect });

  const expectedSelectedOption = Array.from(document.querySelectorAll('option')).filter(
    option => option.textContent === labelToSelect,
  )[0];

  expect(select.value).to.equal(expectedSelectedOption.value);
});

it('natively selects an option with multiple values', async () => {
  const valuesToSelect = ['second', 'third'];
  document.body.innerHTML = selectTemplate;
  const select = document.querySelector('#testSelect');
  select.multiple = true;
  await selectOption({ selector: '#testSelect', values: valuesToSelect });
  const selectedValues = Array.from(select.selectedOptions, option => option.value);
  expect(selectedValues).to.deep.equal(valuesToSelect);
});

it('change and input events are fired after option is selected', async () => {
  let changeEventFired, inputEventFired;
  const valueToSelect = 'first';
  document.body.innerHTML = selectTemplate;
  const select = document.querySelector('#testSelect');

  select.addEventListener('change', () => (changeEventFired = true));
  select.addEventListener('input', () => (inputEventFired = true));
  await selectOption({ selector: '#testSelect', value: valueToSelect });

  expect(changeEventFired).to.equal(true);
  expect(inputEventFired).to.equal(true);
});
