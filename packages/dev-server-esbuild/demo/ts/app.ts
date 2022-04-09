import { LitElement, customElement, property, html } from 'lit-element';

@customElement('my-app')
class MyApp extends LitElement {
  @property({ type: String })
  foo = 'bar';

  render() {
    return html`
      <p>Hello world</p>
    `;
  }
}
