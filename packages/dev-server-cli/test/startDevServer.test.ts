import { DevServerCoreConfig } from '@web/dev-server-core';
import { expect } from 'chai';
import { join } from 'path';
import fetch from 'node-fetch';

import { startDevServer } from '../src/startDevServer';
import { readConfig } from '../src/config/readConfig';

describe('startDevServer', () => {
  it('starts a functioning dev server', async () => {
    const config = await readConfig<DevServerCoreConfig>({
      rootDir: join(__dirname, 'fixtures'),
    });
    const devServer = await startDevServer(config as DevServerCoreConfig, {
      autoExitProcess: false,
      logStartMessage: false,
    });
    const basePath = `http${config.http2 ? 's' : ''}://${config.hostname}:${config.port}`;
    const response = await fetch(`${basePath}/hello-world.txt`);

    expect(response.status).to.equal(200);
    expect(await response.text()).to.equal('Hello world!');

    await devServer.stop();
  });
});
