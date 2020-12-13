import { playwrightLauncher } from '@web/test-runner-playwright';

export default /** @type {import('@web/test-runner').TestRunnerConfig} */ ({
  nodeResolve: true,
  rootDir: '../../',

  files: ['demo/test/pass-*.test.{js,html}'],

  groups: [
    {
      name: 'chromium-a',
      files: 'demo/test/pass-*.test.js',
      browsers: [playwrightLauncher({ product: 'chromium' })],
    },
    {
      name: 'chromium-b',
      files: 'demo/test/pass-*.test.js',
      browsers: [playwrightLauncher({ product: 'chromium' })],
    },
    {
      name: 'firefox',
      files: 'demo/test/pass-*.test.js',
      browsers: [playwrightLauncher({ product: 'firefox' })],
    },
    {
      name: 'webkit',
      files: 'demo/test/pass-*.test.js',
      browsers: [playwrightLauncher({ product: 'webkit' })],
    },
  ],
});
