import { runWorkspacesScripts } from './runWorkspacesScripts.mjs';

runWorkspacesScripts({
  script: 'test:ci',
  concurrency: 1,
});
