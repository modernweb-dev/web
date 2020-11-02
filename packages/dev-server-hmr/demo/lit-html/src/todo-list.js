import { html } from 'lit-html';
import { BaseElement } from './BaseElement.js';
import './todo-item.js';

class TodoList extends BaseElement {
  constructor() {
    super();
    this._items = [
      { message: 'Do A', checked: true },
      { message: 'Do B', checked: false },
      { message: 'Do C', checked: true },
      { message: 'Do D', checked: false },
      { message: 'Do E', checked: false },
    ];
  }

  get styles() {
    return html`
      <style>
        div {
          color: blue;
        }
      </style>
    `;
  }

  get template() {
    return html`
      <h2>TODO list</h2>
      <ul>
        ${this._items.map(
          (item, i) =>
            html`<li>
              <todo-item
                .message=${item.message}
                .checked=${item.checked}
                data-i=${i}
                @checked-changed=${this._onCheckedChanged}
              ></todo-item>
            </li>`,
        )}
      </ul>
    `;
  }

  set items(value) {
    this._items = value;
    this.update();
  }

  get items() {
    return this._items;
  }

  _onCheckedChanged(e) {}
}

customElements.define('todo-list', TodoList);

if (import.meta.hot) {
  import.meta.hot.accept(() => {});
}
