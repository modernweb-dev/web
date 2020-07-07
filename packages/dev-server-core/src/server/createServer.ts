import Koa from 'koa';
import path from 'path';
import { FSWatcher } from 'chokidar';
import httpServer, { IncomingMessage, ServerResponse } from 'http';
import http2Server from 'http2';
import fs from 'fs';
import net, { Server, Socket, ListenOptions } from 'net';

import { EventStreamManager } from '../event-stream/EventStreamManager';
import { DevServerCoreConfig } from '../DevServerCoreConfig';
import { createMiddleware } from './createMiddleware';
import { Logger } from '../logger/Logger';
import { createPlugins } from './createPlugins';

/**
 * A request handler that returns a 301 HTTP Redirect to the same location as the original
 * request but using the https protocol
 */
function httpsRedirect(req: IncomingMessage, res: ServerResponse) {
  const { host } = req.headers;
  res.writeHead(301, { Location: `https://${host}${req.url}` });
  res.end();
}

/**
 * Creates a koa server with middlewares, but does not start it. Returns the koa app and
 * http server instances.
 */
export function createServer(
  cfg: DevServerCoreConfig,
  eventStreams: EventStreamManager,
  logger: Logger,
  fileWatcher: FSWatcher,
) {
  const app = new Koa();

  const plugins = createPlugins(cfg);
  cfg.plugins.push(...plugins);

  const middleware = createMiddleware(cfg, eventStreams, logger, fileWatcher);
  for (const m of middleware) {
    app.use(m);
  }

  let server: Server;
  if (cfg.http2) {
    const dir = path.join(__dirname, '..');
    const options = {
      key: fs.readFileSync(
        cfg.sslKey
          ? path.resolve(cfg.sslKey)
          : path.join(dir, '..', '.self-signed-dev-server-ssl.key'),
      ),
      cert: fs.readFileSync(
        cfg.sslCert
          ? path.resolve(cfg.sslCert)
          : path.join(dir, '..', '.self-signed-dev-server-ssl.cert'),
      ),
      allowHTTP1: true,
    };

    const httpsRedirectServer = httpServer.createServer(httpsRedirect);
    const appServer = http2Server.createSecureServer(options, app.callback());
    let appServerPort: number;
    let httpsRedirectServerPort: number;

    /**
     * A connection handler that checks if the connection is using TLS
     */
    const httpRedirectProxy = (socket: Socket) => {
      socket.once('data', buffer => {
        // A TLS handshake record starts with byte 22.
        const address = buffer[0] === 22 ? appServerPort : httpsRedirectServerPort;
        const proxy = (net as any).createConnection(address, () => {
          proxy.write(buffer);
          socket.pipe(proxy).pipe(socket);
        });
      });
    };

    server = net.createServer(httpRedirectProxy);

    server.addListener('close', () => {
      httpsRedirectServer.close();
      appServer.close();
    });

    server.addListener('listening', () => {
      const info = server.address();
      if (!info || typeof info === 'string') {
        return;
      }
      const { address, port } = info;
      appServerPort = port + 1;
      httpsRedirectServerPort = port + 2;

      appServer.listen({ address, port: appServerPort });
      httpsRedirectServer.listen({ address, port: httpsRedirectServerPort });
    });

    const serverListen = server.listen.bind(server);
    (server as any).listen = (config: ListenOptions, callback: () => void) => {
      appServer.addListener('listening', callback);
      serverListen(config);
      return server;
    };
  } else {
    server = httpServer.createServer(app.callback());
  }

  return {
    server,
    app,
  };
}
