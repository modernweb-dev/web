import { playwrightLauncher } from '@web/test-runner-playwright';

export default /** @type {import('@web/test-runner').TestRunnerConfig} */ ({
  nodeResolve: true,
  rootDir: '../../',

  groups: [
    {
      name: 'firefox',
      files: 'demo/test/focus/focus-*.test.js',
      browsers: [playwrightLauncher({ product: 'firefox', concurrency: 1 })],
    },
    {
      name: 'chromium',
      files: 'demo/test/focus/focus-*.test.js',
      browsers: [playwrightLauncher({ product: 'chromium' })],
    },
    {
      name: 'webkit',
      files: 'demo/test/focus/focus-*.test.js',
      browsers: [playwrightLauncher({ product: 'webkit' })],
    },
  ],
});
