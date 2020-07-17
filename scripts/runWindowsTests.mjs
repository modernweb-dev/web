import { runWorkspacesScripts } from './runWorkspacesScripts.mjs';

runWorkspacesScripts({
  script: 'test:ci',
  concurrency: 1,
  filteredPackages: [
    // playwright can't install browsers on my windows VM
    // 'test-runner-playwright',
    // 'test-runner-selenium',
  ],
});
