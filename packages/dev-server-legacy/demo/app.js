import { LitElement, html } from 'lit-element';

class MyApp extends LitElement {
  static properties = {
    foo: { type: String },
  };

  constructor() {
    super();
    this.foo = 'bar';
  }

  render() {
    return html`<p>Hello world</p>`;
  }
}

customElements.define('my-app', MyApp);
