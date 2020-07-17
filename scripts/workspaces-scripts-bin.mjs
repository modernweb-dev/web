import { runWorkspacesScripts } from './runWorkspacesScripts.mjs';

const script = process.argv[process.argv.length - 1];
runWorkspacesScripts({ script, concurrency: 5 });
