// @ts-nocheck

import { makeDecorator } from '@web/storybook-prebuilt/addons';
import { registerMockRoutes } from '../browser.js';

export const withMocks = makeDecorator({
  name: 'withMocks',
  parameterName: 'mocks',
  wrapper: (getStory, context) => {
    const mocks = context.parameters?.mocks ?? context.story?.parameters?.mocks;
    if (mocks) {
      registerMockRoutes(mocks);
    }

    return getStory(context);
  },
});
