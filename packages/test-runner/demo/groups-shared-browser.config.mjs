import { playwrightLauncher } from '@web/test-runner-playwright';

export default /** @type {import('@web/test-runner').TestRunnerConfig} */ ({
  nodeResolve: true,
  rootDir: '../../',

  groups: [
    {
      name: 'group-a',
      files: 'demo/test/pass-1.test.js',
    },
    {
      name: 'group-b',
      files: 'demo/test/pass-2.test.js',
    },
  ],
});
