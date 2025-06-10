import path from 'path';
import { fileURLToPath } from 'url';
import { runTests } from '@web/test-runner-core/test-helpers';
import { chromeLauncher } from '@web/test-runner-chrome';
import { nodeResolvePlugin } from '@web/dev-server';

import { moduleMockingPlugin } from '../src/moduleMockingPlugin.js';
import { expect } from 'chai';

const dirname = fileURLToPath(new URL('.', import.meta.url));

describe('moduleMockingPlugin', function test() {
  this.timeout(20000);

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

    expect(sessions.length).to.equal(1);
    expect(sessions[0].passed).to.equal(false);
    expect(sessions[0].errors.length).to.equal(1);
    expect(sessions[0].logs[0][0]).to.match(/Error: Module interception is not active./);
    expect(sessions[0].errors[0].message).to.match(/Could not import your test module./);
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

    expect(sessions.length).to.equal(1);
    expect(sessions[0].passed).to.equal(false);
    expect(sessions[0].errors.length).to.equal(1);
    expect(sessions[0].logs[0][0]).to.match(/Error: Could not resolve "\/inexistent-module.js"./);
    expect(sessions[0].errors[0].message).to.match(/Could not import your test module./);
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

    expect(sessions.length).to.equal(1);
    expect(sessions[0].passed).to.equal(false);
    expect(sessions[0].errors.length).to.equal(1);
    expect(sessions[0].logs[0][0]).to.match(
      /Error: Parameter `moduleName` \('.\/file\.js'\) contains a relative reference./,
    );
    expect(sessions[0].errors[0].message).to.match(/Could not import your test module./);
  });
});
