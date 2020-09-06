import { visualDiff } from '../browser/commands.mjs';

it('can diff an image', async () => {
  const element = document.createElement('p');
  element.textContent = 'Hello world';
  element.style.color = 'blue';
  document.body.appendChild(element);

  await visualDiff(element, 'my-element');
});
