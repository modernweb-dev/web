import { html, render } from 'lit-html';
import { LitElement } from 'lit-element';

class MyElement extends LitElement {
  connectedCallback() {
    super.connectedCallback();

    render(
      html`
        <p>Web component instantiated ✓</p>
      `,
      document.getElementById('web-component'),
    );
  }

  render() {
    return html`
      <p>Element Shadow DOM content ✓</p>
    `;
  }
}

customElements.define('my-element', MyElement);

window.__nodeResolve = !!html && !!render && !!LitElement;