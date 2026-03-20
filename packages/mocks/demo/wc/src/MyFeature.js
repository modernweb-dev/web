// @ts-nocheck

import { LitElement, html } from 'lit';

class MyElement extends LitElement {
  static properties = {
    transactions: { type: Array },
    state: { type: String },
  }

  async connectedCallback() {
    super.connectedCallback();
    this.state = 'PENDING';
    try {
      this.transactions = await fetch('/api/transactions').then(r => r.json()).then(({ transactions }) => transactions);
      this.state = 'SUCCESS'
    } catch {
      this.state = 'ERROR';
    }
  }

  render() {
    switch (this.state) {
      case 'PENDING':
        return html`<p>Loading...</p>`;
      case 'ERROR':
        return html`<p>Something went wrong</p>`;
      case 'SUCCESS':
        return html`
          <ul>
            ${this.transactions.map(t => html`<li>${t}</li>`)}
          </ul>
        `;
    }
  }
}

customElements.define('my-element', MyElement);
