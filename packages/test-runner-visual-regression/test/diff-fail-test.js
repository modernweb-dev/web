import { visualDiff } from '../browser/commands.mjs';

it('can diff an image', async () => {
  const element = document.createElement('p');
  element.textContent = 'Hello world';
  element.style.color = 'red';
  document.body.appendChild(element);

  await visualDiff(element, 'my-failed-element');
});
