import { expect } from '../../../../node_modules/chai/index.js';
import { a11ySnapshot, findAccessibilityNode } from '../../browser/commands.mjs';

customElements.define(
  'x-shadow-host',
  class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).innerHTML = '<button>Inner</button><slot></slot>';
    }
  },
);

customElements.define(
  'x-internals-checkbox',
  class extends HTMLElement {
    constructor() {
      super();
      const internals = this.attachInternals();
      internals.role = 'checkbox';
      internals.ariaLabel = 'Internals';
      internals.ariaChecked = 'true';
      this.tabIndex = 0;
    }
  },
);

let container;

beforeEach(() => {
  container = document.createElement('div');
  container.innerHTML = `
    <h2>Heading</h2>
    <button id="bold" aria-pressed="true">Bold</button>
    <input id="mixed" type="checkbox" aria-label="Mixed">
    <div role="slider" aria-label="Volume" aria-valuemin="0" aria-valuemax="10" aria-valuenow="5" tabindex="0"></div>
    <select aria-label="Size"><option>Small</option><option selected>Medium</option></select>
    <x-shadow-host><a href="#slotted">Slotted</a></x-shadow-host>
    <x-internals-checkbox></x-internals-checkbox>
    <nav aria-label="Navigation"><p>Text</p></nav>
  `;
  document.body.append(container);
  container.querySelector('#mixed').indeterminate = true;
});

afterEach(() => {
  container.remove();
});

it('returns the page tree with only interesting nodes', async () => {
  const snapshot = await a11ySnapshot();
  expect(snapshot.role).to.equal('WebArea');
  const find = name => findAccessibilityNode(snapshot, node => node.name === name);
  expect(find('Heading')).to.deep.equal({ role: 'heading', name: 'Heading', level: 2 });
  expect(find('Bold')).to.deep.equal({ role: 'button', name: 'Bold', pressed: true });
  expect(find('Mixed')).to.deep.equal({ role: 'checkbox', name: 'Mixed', checked: 'mixed' });
  expect(find('Volume')).to.deep.equal({
    role: 'slider',
    name: 'Volume',
    valuetext: '',
    valuemin: 0,
    valuemax: 10,
    orientation: 'horizontal',
    value: 5,
  });
  expect(find('Navigation')).to.equal(null);
});

it('returns nodes from shadow DOM and element internals', async () => {
  const snapshot = await a11ySnapshot();
  const find = name => findAccessibilityNode(snapshot, node => node.name === name);
  expect(find('Inner')).to.deep.equal({ role: 'button', name: 'Inner' });
  expect(find('Slotted')).to.deep.equal({ role: 'link', name: 'Slotted' });
  expect(find('Internals')).to.deep.equal({ role: 'checkbox', name: 'Internals', checked: true });
});

it('returns the tree of the element that matches the selector', async () => {
  expect(await a11ySnapshot({ selector: '#bold' })).to.deep.equal({
    role: 'button',
    name: 'Bold',
    pressed: true,
  });
  expect(await a11ySnapshot({ selector: 'x-shadow-host button' })).to.deep.equal({
    role: 'button',
    name: 'Inner',
  });
  const select = await a11ySnapshot({ selector: 'select' });
  expect(select).to.include({ role: 'combobox', name: 'Size', value: 'Medium' });
});
