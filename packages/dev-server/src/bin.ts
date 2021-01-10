#!/usr/bin/env node
import { startDevServer } from './startDevServer';

startDevServer({
  readCliArgs: true,
  readFileConfig: true,
  autoExitProcess: true,
  logStartMessage: true,
});
