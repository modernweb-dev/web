import { visualDiff } from '@web/test-runner-visual-regression';
import { hover } from '../../browser/commands.mjs';

let element;

before(() => {
  const style = document.createElement('style');
  style.textContent = `
    .element {
      background: red;
      width: 100px;
      height: 100px;
    }

    .element:hover {
      background: blue;
    }
  `;

  document.head.appendChild(style);
});

beforeEach(() => {
  element = document.createElement('div');
  element.classList.add('element');
  document.body.appendChild(element);
});

afterEach(() => {
  element.remove();
});

it('can hover on an element', async () => {
  await visualDiff(element, 'element');
  await hover('.element');
  await visualDiff(element, 'element-hover');
});
