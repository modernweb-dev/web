import { a11ySnapshot, findAccessibilityNode } from '../../browser/commands.mjs';
import { expect } from '../chai.js';

it('returns an accessibility tree with appropriately labelled element in it', async () => {
  const buttonText = 'Button Text';
  const labelText = 'Label Text';
  const fullText = `${labelText} ${buttonText}`;
  const label = document.createElement('label');
  label.textContent = labelText;
  label.id = 'label';
  const button = document.createElement('button');
  button.textContent = buttonText;
  button.id = 'button';
  button.setAttribute('aria-labelledby', 'label button');
  document.body.append(label, button);
  const snapshot = await a11ySnapshot();
  const foundNode = findAccessibilityNode(
    snapshot,
    node => node.name === fullText && node.role === 'button',
  );
  expect(foundNode, 'A node with the supplied name has been found').to.not.be.null;
  label.remove();
  button.remove();
});
