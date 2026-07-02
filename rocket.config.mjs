import { rocketBlog } from '@rocket/blog';
import { absoluteBaseUrlNetlify } from '@rocket/core/helpers';
import { rocketLaunch } from '@rocket/launch';
import { rocketSearch } from '@rocket/search';

export default {
  presets: [rocketLaunch(), rocketBlog(), rocketSearch()],
  absoluteBaseUrl: absoluteBaseUrlNetlify('http://localhost:8080'),
  serviceWorkerName: 'sw.js',
};
