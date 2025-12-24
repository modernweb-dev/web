// @ts-nocheck

import { html } from 'lit';
import { http } from '../../../http.js';
import { MyElement } from '../src/MyElement.js';

customElements.define('my-element', MyElement);

export default {
  title: 'My element',
  render: () => html`<my-element></my-element>`,
};

export const Default = {
  parameters: {
    mocks: [
      http.get('/api/transactions', () => Response.json({ transactions: ['foo', 'bar'] })),
      http.post('/api/transactions/create', () => Response.json({ ok: true })),
      http.put('/api/transactions/update', () => Response.json({ ok: true })),
    ],
  },
};

export const Second = {
  parameters: {
    mocks: [
      http.get('/api/transactions', () => Response.json({ transactions: ['foo 2', 'bar 2'] })),
      http.post('/api/transactions/create', () => Response.json({ ok: true })),
      http.put('/api/transactions/update', () => Response.json({ ok: true })),
    ],
  },
};
