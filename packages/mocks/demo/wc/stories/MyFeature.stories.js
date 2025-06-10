// @ts-nocheck

import { html } from 'lit';
import { http } from '../../../http.js';
import '../src/MyFeature.js';

export default {
  title: 'My feature',
};

const Template = () => html`<my-element></my-element>`;
export const Default = Template.bind({});
Default.parameters = {
  mocks: [
    http.get('/api/transactions', () => Response.json({transactions: ['foo', 'bar'] })),
    http.post('/api/transactions/create', () => Response.json({ ok: true })),
    http.put('/api/transactions/update', () => Response.json({ ok: true })),
  ]
}

export const Second = Template.bind({});
Second.parameters = {
  mocks: [
    http.get('/api/transactions', () => Response.json({transactions: ['foo', 'bar'] })),
    http.post('/api/transactions/create', () => Response.json({ ok: true })),
    http.put('/api/transactions/update', () => Response.json({ ok: true })),
  ]
}

export const NoMocks = Template.bind({});
