import { visualDiff } from '../browser/commands.mjs';

it('can diff an image', async () => {
  const element = document.createElement('div');
  element.style.padding = '10px';
  const inner = document.createElement('div');
  inner.style.backgroundColor = 'red';
  element.appendChild(inner);
  inner.style.width = '40px';
  inner.style.height = '40px';
  document.body.appendChild(element);

  await visualDiff(element, 'my-failed-element');
});
