import Koa from 'koa';
import { Server } from 'net';
import chokidar from 'chokidar';
import { promisify } from 'util';

import { EventStreamManager } from '../event-stream/EventStreamManager';
import { DevServerCoreConfig } from '../DevServerCoreConfig';
import { createServer } from './createServer';
import { Logger } from '../logger/Logger';

export class DevServer {
  public koaApp: Koa;
  public server: Server;
  public eventStreams = new EventStreamManager();

  constructor(
    public config: DevServerCoreConfig,
    public logger: Logger,
    public fileWatcher = chokidar.watch([]),
  ) {
    if (!config) throw new Error('Missing config.');
    if (!logger) throw new Error('Missing logger.');

    const createResult = createServer(
      this.config,
      this.eventStreams,
      this.logger,
      this.fileWatcher,
    );
    this.koaApp = createResult.app;
    this.server = createResult.server;
  }

  async start() {
    await promisify(this.server.listen).bind(this.server)({
      port: this.config.port,
      host: this.config.hostname,
    });

    for (const plugin of this.config.plugins) {
      await plugin.serverStart?.({
        config: this.config,
        app: this.koaApp,
        server: this.server,
        logger: this.logger,
        eventStreams: this.eventStreams,
        fileWatcher: this.fileWatcher,
      });
    }
  }

  stop() {
    return Promise.all([
      this.fileWatcher.close(),
      promisify(this.server.close).bind(this.server)(),
      ...this.config.plugins.map(p => p.serverStop?.()),
    ]);
  }
}
