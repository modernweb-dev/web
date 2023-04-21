import { sharedTemplate } from './sharedTemplate.js';

const renderedComponents = new Set();

export class MyComponent extends HTMLElement {
  static styles = `
    h1 { color: hotpink; }
    p { color: olivegreen; }
  `;

  static template = `
    <h1>Foo</h1>
    <p>Bar</p>
  `;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    renderedComponents.add(this);
    this.render();
  }

  disconnectedCallback() {
    renderedComponents.delete(this);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${MyComponent.styles}</style>
      ${sharedTemplate}
      ${MyComponent.template}
    `;
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ module }) => {
    MyComponent.styles = module.MyComponent.styles;
    MyComponent.template = module.MyComponent.template;
    for (const component of renderedComponents) {
      component.render();
    }
  });
}

if (!window.customElements.get('my-component')) {
  window.customElements.define('my-component', MyComponent);
}
