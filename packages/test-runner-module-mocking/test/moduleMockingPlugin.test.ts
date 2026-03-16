import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import { fileURLToPath } from 'url';
<<<<<<< HEAD
import { runTests } from '@web/test-runner-core/test-helpers.js';
import { chromeLauncher } from '@web/test-runner-chrome.js';
import { nodeResolvePlugin } from '@web/dev-server.js';
||||||| parent of 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { runTests } from '@web/test-runner-core/test-helpers.ts';
import { chromeLauncher } from '@web/test-runner-chrome.ts';
import { nodeResolvePlugin } from '@web/dev-server.ts';
=======
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { nodeResolvePlugin } from '@web/dev-server';
>>>>>>> 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)

<<<<<<< HEAD
import { moduleMockingPlugin } from '../src/moduleMockingPlugin.js';
||||||| parent of c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { moduleMockingPlugin } from '../src/moduleMockingPlugin.ts';
=======
<<<<<<< HEAD
import { moduleMockingPlugin } from '../src/moduleMockingPlugin.ts';
>>>>>>> c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { expect } from 'chai';
||||||| parent of 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { moduleMockingPlugin } from '../src/moduleMockingPlugin.js';
import { expect } from 'chai';
=======
import { moduleMockingPlugin } from '../dist/moduleMockingPlugin.js';
>>>>>>> 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)

const dirname = fileURLToPath(new URL('.', import.meta.url));

describe('moduleMockingPlugin', { timeout: 20000 }, () => {

  it('can intercept server relative modules', async () => {
    await runTests({
      files: [path.join(dirname, 'fixtures', 'server-relative', 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [moduleMockingPlugin(), nodeResolvePlugin('', false, {})],
    });
  });

  it('can intercept bare modules', async () => {
    const rootDir = path.resolve(dirname, 'fixtures', 'bare', 'fixture');
    // Define the bare module as duped to force nodeResolve to use the passed rootDir instead of the cwd
    const dedupe = (importee: string) => importee === 'time-library/hour';

    await runTests({
      files: [path.join(dirname, 'fixtures', 'bare', 'browser-test.js')],
      browsers: [chromeLauncher()],
      plugins: [moduleMockingPlugin(), nodeResolvePlugin(rootDir, false, { dedupe })],
    });
  });

  it('throws when trying to intercept without the plugin', async () => {
    const { sessions } = await runTests(
      {
        files: [path.join(dirname, 'fixtures', 'server-relative', 'browser-test.js')],
        browsers: [chromeLauncher()],
        plugins: [nodeResolvePlugin('', false, {})],
      },
      [],
      { allowFailure: true, reportErrors: false },
    );

    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].passed, false);
    assert.equal(sessions[0].errors.length, 1);
    assert.match(sessions[0].logs[0][0], /Error: Module interception is not active./);
    assert.match(sessions[0].errors[0].message, /Could not import your test module./);
  });

  it('throws when trying to intercept an inexistent module', async () => {
    const { sessions } = await runTests(
      {
        files: [path.join(dirname, 'fixtures', 'inexistent', 'browser-test.js')],
        browsers: [chromeLauncher()],
        plugins: [moduleMockingPlugin(), nodeResolvePlugin('', false, {})],
      },
      [],
      { allowFailure: true, reportErrors: false },
    );

    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].passed, false);
    assert.equal(sessions[0].errors.length, 1);
    assert.match(sessions[0].logs[0][0], /Error: Could not resolve "\/inexistent-module.js"./);
    assert.match(sessions[0].errors[0].message, /Could not import your test module./);
  });

  it('throws when trying to intercept a relative module', async () => {
    const { sessions } = await runTests(
      {
        files: [path.join(dirname, 'fixtures', 'relative', 'browser-test.js')],
        browsers: [chromeLauncher()],
        plugins: [moduleMockingPlugin(), nodeResolvePlugin('', false, {})],
      },
      [],
      { allowFailure: true, reportErrors: false },
    );

    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].passed, false);
    assert.equal(sessions[0].errors.length, 1);
    assert.match(
      sessions[0].logs[0][0],
      /Error: Parameter `moduleName` \('.\/file\.js'\) contains a relative reference./,
    );
    assert.match(sessions[0].errors[0].message, /Could not import your test module./);
  });
});
