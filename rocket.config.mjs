import { rocketLaunch } from '@rocket/launch';
import { rocketBlog } from '@rocket/blog';
import { rocketSearch } from '@rocket/search';
import { absoluteBaseUrlNetlify } from '@rocket/core/helpers';
import { adjustPluginOptions } from 'plugins-manager';
import path from 'path';

const serviceWorkerPath = path.resolve('./_site/sw.js');

export default {
  presets: [rocketLaunch(), rocketBlog(), rocketSearch()],
  absoluteBaseUrl: absoluteBaseUrlNetlify('http://localhost:8080'),
  setupBuildPlugins: [
    adjustPluginOptions('workbox', { swDest: serviceWorkerPath }),
    adjustPluginOptions('html', { serviceWorkerPath }),
  ],
};
