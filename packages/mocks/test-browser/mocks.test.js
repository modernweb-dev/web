import { http } from '../http.js';
import { expect } from '@esm-bundle/chai';
import { registerMockRoutes } from '../browser.js';

it('mocks a request', async () => {
  registerMockRoutes(http.get('/api/foo', () => Response.json({ foo: 'foo' })));
  const { foo } = await fetch('/api/foo').then(r => r.json());
  expect(foo).to.equal('foo');
});

it('overrides a previous handler', async () => {
  registerMockRoutes(http.get('/api/foo', () => Response.json({ foo: 'bar' })));
  const { foo } = await fetch('/api/foo').then(r => r.json());
  expect(foo).to.equal('bar');
});
