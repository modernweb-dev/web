import { LayoutSidebar } from '@rocket/launch';
import { adjustPluginOptions } from 'plugins-manager';
import { mdjsSetupCode } from '@mdjs/core';
import { footerMenu } from './__shared/footerMenu.js';
import { pageTree } from './__shared/pageTree.js';
import { html } from 'lit';
import { rocketComponents } from '@rocket/components/components.js';
import { searchComponents } from '@rocket/search/components.js';
import htmlHeading from 'rehype-autolink-headings';
import { search } from './__shared/search.js';
import { launchComponents } from '@rocket/launch/components.js';
import { layoutOverrides } from './__shared/layoutOverrides.js';

export { html };

export const layout = new LayoutSidebar({
  pageTree,
  footerMenu,
  description:
    'Rocket enables everyone to code a website. Use an existing theme or create your own. Be fast by server rendering web components with little to no JavaScript.',
  header__40: search,
  drawer__30: search,
  ...layoutOverrides,
});

export const setupUnifiedPlugins = [
  adjustPluginOptions(mdjsSetupCode, {
    simulationSettings: {
      simulatorUrl: '/simulator/',
      themes: [
        { key: 'light', name: 'Light' },
        { key: 'dark', name: 'Dark' },
      ],
      platforms: [
        { key: 'web', name: 'Web' },
        { key: 'android', name: 'Android' },
        { key: 'ios', name: 'iOS' },
      ],
    },
  }),
  // this adds an octicon to the headlines
  adjustPluginOptions(htmlHeading, {
    properties: {
      className: ['anchor'],
    },
    content: [
      {
        type: 'element',
        tagName: 'svg',
        properties: {
          className: ['octicon', 'octicon-link'],
          viewBox: '0 0 16 16',
          ariaHidden: 'true',
          width: 16,
          height: 16,
        },
        children: [
          {
            type: 'element',
            tagName: 'path',
            properties: {
              fillRule: 'evenodd',
              d: 'M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z',
            },
          },
        ],
      },
    ],
  }),
];

export const components = {
  ...rocketComponents,
  ...searchComponents,
  ...launchComponents,
};

// export const openGraphLayout = data => html`
//   <!DOCTYPE html>
//   <html lang="en">
//     <head>
//       <meta charset="utf-8" />
//       <link
//         rel="preload"
//         href="/fonts/Rubik-VariableFont_wght.woff2"
//         as="font"
//         type="font/woff2"
//         crossorigin
//       />
//       <style>
//         @font-face {
//           font-family: 'Rubik';
//           src: url('/fonts/Rubik-VariableFont_wght.woff2') format('woff2 supports variations'),
//             url('/fonts/Rubik-VariableFont_wght.woff2') format('woff2-variations');
//           font-weight: 1 999;
//           font-display: optional;
//         }
//         body {
//           background: conic-gradient(from 90deg at 50% 0%, #111, 50%, #222, #111);
//           color: #ccc;
//           display: block;
//           height: 100vh;
//           padding: 30px;
//           box-sizing: border-box;
//           margin: 0;
//           font-family: 'Rubik', sans-serif;
//         }
//         #powered-by {
//           margin: 3%;
//           font-size: 40px;
//           display: flex;
//           align-items: center;
//           gap: 14px;
//           position: absolute;
//           bottom: 0;
//         }
//         #powered-by img {
//           height: 40px;
//         }

//         h1 {
//           background: linear-gradient(to bottom right, #ffe259, #ffa751);
//           -webkit-background-clip: text;
//           -webkit-text-fill-color: transparent;
//           font-size: 100px;
//           margin: 3%;
//         }
//         p {
//           margin: 3%;
//         }
//         #sub-title {
//           font-size: 50px;
//           max-width: 67%;
//         }
//         #bg-wrapper {
//           position: absolute;
//           width: 100vw;
//           height: 100vh;
//           overflow: hidden;
//           left: 0;
//           top: 0;
//         }
//         #bg-wrapper img {
//           position: absolute;
//           right: -20%;
//           top: 32%;
//           transform: rotate(326deg);
//           width: 59%;
//         }
//         .item {
//           display: flex;
//           align-items: center;
//           gap: 20px;
//         }
//         .item card-icon {
//           width: 50px;
//           height: 50px;
//         }
//       </style>
//     </head>
//     <body>
//       <h1>${pageTree.getPage(data.sourceRelativeFilePath)?.model?.name}</h1>
//       <p id="sub-title">${data.subTitle || ''}</p>
//       <div id="powered-by">
//         <span>powered by</span>
//         <img id="logo" src="resolve:#assets/rocket-logo-dark-with-text.svg" />
//       </div>
//       <div id="bg-wrapper">
//         <img src="resolve:#assets/home-background.svg" />
//       </div>
//     </body>
//   </html>
// `;
