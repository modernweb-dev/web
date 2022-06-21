import { html } from 'lit';

export const search = html`
  <rocket-search
    loading="hydrate:onFocus"
    class="search"
    json-url="/rocket-search-index.json"
    slot="search"
  ></rocket-search>
`;
