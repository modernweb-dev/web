import Koa from 'koa';
import { ListenOptions, Server, Socket } from 'net';
import chokidar from 'chokidar';
import { promisify } from 'util';

import { DevServerCoreConfig } from './DevServerCoreConfig';
import { createServer } from './createServer';
import { Logger } from '../logger/Logger';
import { WebSocketsManager } from '../web-sockets/WebSocketsManager';

export class DevServer {
  public koaApp: Koa;
  public server?: Server;
  public webSockets?: WebSocketsManager;
  private started = false;
  private connections = new Set<Socket>();

  constructor(
    public config: DevServerCoreConfig,
    public logger: Logger,
    public fileWatcher = chokidar.watch([]),
  ) {
    if (!config) throw new Error('Missing config.');
    if (!logger) throw new Error('Missing logger.');

    const { app, server } = createServer(
      this.logger,
      this.config,
      this.fileWatcher,
      !!config.middlewareMode,
    );
    this.koaApp = app;
    if (server) {
      this.server = server;
      this.webSockets = new WebSocketsManager(this.server);
      this.server.on('connection', connection => {
        this.connections.add(connection);
        connection.on('close', () => {
          this.connections.delete(connection);
        });
      });
    } else if (
      typeof this.config.middlewareMode === 'object' &&
      this.config.middlewareMode.server
    ) {
      this.webSockets = new WebSocketsManager(this.config.middlewareMode.server);
    }
  }

  async start() {
    this.started = true;
    if (this.server && this.config.hostname) {
      await (promisify<ListenOptions>(this.server.listen).bind(this.server) as any)({
        port: this.config.port,
        // in case of localhost the host should be undefined, otherwise some browsers
        // connect to it via local network. for example safari on browserstack
        host: ['localhost', '127.0.0.1'].includes(this.config.hostname)
          ? undefined
          : this.config.hostname,
      });
    }

    for (const plugin of this.config.plugins ?? []) {
      await plugin.serverStart?.({
        config: this.config,
        app: this.koaApp,
        server: this.server,
        logger: this.logger,
        webSockets: this.webSockets,
        fileWatcher: this.fileWatcher,
      });
    }
  }

  private closeServer() {
    if (!this.server) {
      return;
    }

    // close all open connections
    for (const connection of this.connections) {
      connection.destroy();
    }

    return new Promise<void>(resolve => {
      this.server!.close(err => {
        if (err) {
          console.error(err);
        }
        resolve();
      });
    });
  }

  async stop() {
    if (!this.started) {
      return;
    }
    this.started = false;

    return Promise.all([
      this.fileWatcher.close(),
      ...(this.config.plugins ?? []).map(p => p.serverStop?.()),
      this.closeServer(),
    ]);
  }
}
