import { __decorate } from "tslib";
import { html, css, LitElement, property } from 'lit-element';
export class MyElement extends LitElement {
    constructor() {
        super(...arguments);
        this.title = 'Hey there';
        this.counter = 5;
    }
    __increment() {
        this.counter += 1;
    }
    render() {
        return html `
      <h2>${this.title} Nr. ${this.counter}!</h2>
      <button @click=${this.__increment}>increment</button>
    `;
    }
}
MyElement.styles = css `
    :host {
      display: block;
      padding: 25px;
      color: var(--my-element-text-color, #000);
    }
  `;
__decorate([
    property({ type: String })
], MyElement.prototype, "title", void 0);
__decorate([
    property({ type: Number })
], MyElement.prototype, "counter", void 0);
//# sourceMappingURL=MyElement.js.map