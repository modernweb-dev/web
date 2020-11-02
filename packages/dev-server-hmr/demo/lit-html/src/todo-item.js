import { html } from 'lit-html';
import { BaseElement } from './BaseElement.js';

class TodoItem extends BaseElement {
  get styles() {
    return html`
      <style>
        .message {
          color: blue;
        }
      </style>
    `;
  }

  get template() {
    return html`
      <div>
        <input type="checkbox" .checked=${!!this.checked} @change=${this._onCheckedChanged} />
        <span class="message">${this.message}</span>
      </div>
    `;
  }

  set checked(value) {
    this._checked = !!value;
    this.update();
  }

  get checked() {
    return this._checked;
  }

  set message(value) {
    this._message = value;
    this.update();
  }

  get message() {
    return this._message;
  }

  _onCheckedChanged(e) {
    this.dispatchEvent(new CustomEvent('checked-changed', { detail: e.target.checked }));
  }
}

customElements.define('todo-item', TodoItem);

if (import.meta.hot) {
  import.meta.hot.accept(() => {});
}
