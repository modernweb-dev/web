// @ts-nocheck

import { LitElement, html, css } from 'lit';
import { when } from 'lit/directives/when.js';

export function registerAddon(addons, React, createAddon) {
  const { createElement } = React;

  class MocksAddonElement extends LitElement {
    static properties = {
      state: { type: String },
      mocks: { type: Array },
      editing: { type: Boolean },
      hasEditedMocks: { type: Boolean },
      copied: { type: Boolean },
    };

    static styles = css`
      table {
        width: 100%;
        margin-bottom: 10px;
        border-collapse: collapse;
      }

      tr {
        border-bottom: 1px solid hsla(203, 50%, 30%, 0.2);
      }

      thead {
        background-color: hsla(203, 50%, 30%, 0.1);
      }

      tr th:first-child {
        width: 9ch;
      }

      tr th:nth-child(2) {
        width: 9ch;
      }

      thead th {
        padding: 10px;
        text-align: left;
      }

      tbody td {
        padding: 10px;
      }

      .message {
        padding: 30px;
        text-align: center;
        font-weight: bold;
      }
    `;

    constructor() {
      super();
      this.editing = false;
      this.mocks = [];
      this.state = 'PENDING';

      this.addEventListener('mocks:loaded', e => {
        this.state = 'SUCCESS';
        this.mocks = e.detail;
        this.hasEditedMocks = this.mocks.some(m => m.changed);
      });

      this.addEventListener('storyChanged', () => {
        this.editing = false;
        this.state = 'PENDING';
      });
    }

    render() {
      if (this.state === 'PENDING') {
        return html`<div class="message">Loading...</div>`;
      }

      if (!this.mocks.length) {
        return html`<div class="message">No mocks configured.</div>`;
      }

      return html`
        <div>
          <form @submit=${this.submit}>
            <table class=${this.editing ? 'editing' : ''}>
              <thead>
                <tr>
                  <th>Override</th>
                  <th>Method</th>
                  <th>Endpoint</th>
                  ${when(
                    this.editing,
                    () => html`
                      <th>Response</th>
                      <th>Status</th>
                    `,
                  )}
                </tr>
              </thead>

              <tbody>
                ${this.mocks.map(
                  ({ method, endpoint, changed, data, status }, i) => html`
                    <tr>
                      <td>${changed ? '✅' : ''}</td>
                      ${when(
                        this.editing,
                        () => html`
                          <td>
                            <span>${method}</span>
                          </td>
                          <td>
                            <span>${endpoint}</span>
                          </td>
                          <td>
                            <textarea aria-label="Response" name="response-${i}" .value=${
                          JSON.stringify(data) ?? ''
                        }></textarea>
                          </td>
                          <td>
                            <input type="number" aria-label="Status code" name="status-${i}" .value=${
                          status ?? ''
                        }></input>
                          </td>
                        `,
                        () => html`
                          <td><span>${method}</span></td>
                          <td><span>${endpoint}</span></td>
                        `,
                      )}
                    </tr>
                  `,
                )}
              </tbody>
            </table>

            ${when(this.editing, () => html`<button type="submit">Save</button>`)}

            <button
              type="button"
              @click=${() => {
                this.editing = !this.editing;
              }}
            >
              ${this.editing ? 'Cancel' : 'Edit'}
            </button>

            ${when(
              !this.editing && this.hasEditedMocks,
              () => html`<button type="button" @click=${this.reset}>Reset</button>`,
            )}

            <br /><br />
            ${when(
              'clipboard' in navigator && this.hasEditedMocks,
              () => html`
                <button type="button" @click=${this.copy}>Share reproduction url</button>

                ${when(this.copied, () => html` <div>Copied to clipboard.</div> `)}
              `,
            )}
          </form>
        </div>
      `;
    }

    reset() {
      const url = new URL(window.location);
      url.searchParams.delete('mocks');
      window.location.href = url.href;
    }

    copy() {
      this.copied = true;
      const url = new URL(window.location);
      const editedMocks = this.mocks.filter(m => m.changed);
      const encodedMocks = encodeURIComponent(JSON.stringify(editedMocks));
      url.searchParams.set('mocks', encodedMocks);
      navigator.clipboard.writeText(url.toString());
      setTimeout(() => {
        this.copied = false;
      }, 3000);
    }

    submit(event) {
      event.preventDefault();
      this.editing = false;

      const formElems = Array.from(event.target.elements);

      // Iterate over each form row, checking if the form values are different from the initial values
      this.mocks = this.mocks.map((mock, index) => {
        const response = formElems.find(elem => elem.name === `response-${index}`).value;
        const status = formElems.find(elem => elem.name === `status-${index}`).valueAsNumber;

        if (response) {
          let responseObj;
          try {
            responseObj = JSON.parse(response);
          } catch {
            throw new Error(`Invalid JSON provided for api call: ${mock.method} ${mock.endpoint}.`);
          }

          mock.changed = true;
          mock.data = responseObj;

          if (status) {
            mock.status = status;
          } else {
            mock.status = 200;
          }
        }

        if (status) {
          if (status < 400 && !response) {
            throw new Error(
              `No response was provided for api call: ${mock.method} ${mock.endpoint}.`,
            );
          }

          mock.changed = true;
          mock.status = status;
        }

        return mock;
      });

      const changedMocks = this.mocks.filter(mock => mock.changed);
      if (changedMocks) {
        this.hasEditedMocks = true;
        addons.getChannel().emit('mocks:edited', changedMocks);
      }
    }
  }

  customElements.define('mocks-addon', MocksAddonElement);

  const MocksAddon = createAddon('mocks-addon', {
    events: ['mocks:loaded', 'mocks:edited'],
  });

  addons.register('web/mocks', api => {
    addons.addPanel('web/mocks/panel', {
      title: 'Mocks',
      paramKey: 'mocks',
      render: ({ active }) => createElement(MocksAddon, { api, active }),
    });
  });
}
