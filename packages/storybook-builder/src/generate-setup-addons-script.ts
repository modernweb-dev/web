// based on https://github.com/storybookjs/storybook/blob/v8.5.0/code/builders/builder-vite/src/codegen-set-addon-channel.ts

export async function generateSetupAddonsScript() {
  return `
import { createBrowserChannel } from 'storybook/internal/channels';
import { addons } from 'storybook/internal/preview-api';

const channel = createBrowserChannel({ page: 'preview' });
addons.setChannel(channel);
window.__STORYBOOK_ADDONS_CHANNEL__ = channel;

if (window.CONFIG_TYPE === 'DEVELOPMENT'){
  window.__STORYBOOK_SERVER_CHANNEL__ = channel;
}
  `.trim();
}
