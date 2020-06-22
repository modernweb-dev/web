import { expect } from '@bundled-es-modules/chai';
import App from '../src/App';
import { fixture } from './test-helpers';

let element;
let restoreFixture;

beforeEach(() => {
  ({ element, restoreFixture } = fixture(<App />));
});

afterEach(() => {
  restoreFixture();
});

it('renders a hello world message', () => {
  expect(element.textContent).to.include('Hello, World!');
});
