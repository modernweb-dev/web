/* START - Rocket auto generated - do not touch */
export const sourceRelativeFilePath = 'index.rocket.js';
import { html, setupUnifiedPlugins, components } from './recursive.data.js';
export { html, setupUnifiedPlugins, components };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-social-link', await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink));
  // prettier-ignore
  customElements.define('rocket-header', await import('@rocket/components/header.js').then(m => m.RocketHeader));
  // prettier-ignore
  customElements.define('launch-home', await import('@rocket/launch/home.js').then(m => m.LaunchHome));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
/* END - Rocket auto generated - do not touch */

import { footerMenu } from './__shared/footerMenu.js';
import { pageTree } from './__shared/pageTree.js';
import { LayoutHome } from '@rocket/launch';
import { search } from './__shared/search.js';
import { layoutOverrides } from './__shared/layoutOverrides.js';

export const description =
  'Rocket enables everyone to code a website. Use an existing theme or create your own. Be fast by server rendering web components with little to no JavaScript.';
export const subTitle = 'Everyone can code a website';

export const layout = new LayoutHome({
  pageTree,
  footerMenu,
  header__40: search,
  drawer__30: search,
  titleWrapperFn: () => 'Welcome to Modern Web',
  ...layoutOverrides,
});

const reasons = [
  {
    header: 'Built on web standards',
    text: "Work with and extend what's available in modern browsers, learning skills, and writing code that stays relevant.",
  },
  {
    header: 'Lightweight',
    text: 'Simple solutions that are lightweight and have a low barrier to entry. With extension points for power users.',
  },
  {
    header: 'Low complexity',
    text: 'Write code that is close to what actually runs in the browser, reducing abstractions and complexity.',
  },
];

export default () => html`
  <launch-home .reasons=${reasons}>
    <h1 slot="title">
      <img src="../src/assets/modern-web-logo.svg" alt="Modern Web" />
      Modern Web
    </h1>
    <p slot="slogan">Guides, tools and libraries for modern web development.</p>
    <a slot="cta" role="listitem" href="/guides/">Follow Guides</a>
    <a slot="cta" role="listitem" href="/docs/">Browse Docs</a>
    <h2 slot="reason-header">Why Modern Web?</h2>

    <img
      src="../src/assets/home-background.svg"
      slot="background"
      role="presentation"
      width="1160"
      height="652.5"
    />

    <style type="text/css">
      /* workaround until Firefox supports width/height on source tags https://bugzilla.mozilla.org/show_bug.cgi?id=1694741 */
      @media (min-width: 1024px) {
        h1 img {
          height: 67.87px;
        }
      }
    </style>
  </launch-home>
`;
