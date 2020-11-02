import { html, render } from 'lit-html';

const connectedElements = new WeakMap();

export class BaseElement extends HTMLElement {
  /**
   * Based on https://github.com/Polymer/lit-element/pull/802
   */
  static hotReplaceCallback(classObj) {
    const existingProps = new Set(Object.getOwnPropertyNames(this.prototype));
    const newProps = new Set(Object.getOwnPropertyNames(classObj.prototype));
    for (const prop of Object.getOwnPropertyNames(classObj.prototype)) {
      Object.defineProperty(
        this.prototype,
        prop,
        Object.getOwnPropertyDescriptor(classObj.prototype, prop),
      );
    }

    for (const existingProp of existingProps) {
      if (!newProps.has(existingProp)) {
        delete this.prototype[existingProp];
      }
    }

    const elements = connectedElements.get(this);
    if (!elements) {
      return;
    }

    for (const element of elements) {
      element.update();
    }
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.update();
    let connected = connectedElements.get(this.constructor);
    if (!connected) {
      connected = new Set();
      connectedElements.set(this.constructor, connected);
    }
    connected.add(this);
  }

  disconnectedCallback() {
    connectedElements.get(this.constructor).delete(this);
  }

  get styles() {
    return html``;
  }

  get template() {
    return html``;
  }

  update() {
    render(html`${this.styles}${this.template}`, this.shadowRoot);
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {});
}
