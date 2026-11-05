// Example web-test-runner config for a Storybook + MSW project using @web/test-runner-pact-reporter.
// See ./README.md for the full recipe.

import { defaultReporter } from '@web/test-runner';
import { pactReporting } from '@web/test-runner-pact-reporter/plugin';

const { plugin, reporter } = pactReporting({
  outputDir: 'pacts',
  consumer: { name: 'my-storybook-app' },
});

export default {
  files: 'stories/**/*.stories.js',
  plugins: [plugin],
  reporters: [defaultReporter(), reporter],
};
