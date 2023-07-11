import Koa from 'koa';
import path from 'path';
import { FSWatcher } from 'chokidar';
import httpServer, { IncomingMessage, ServerResponse } from 'http';
import http2Server from 'http2';
import fs from 'fs';
import net, { Server, Socket, ListenOptions } from 'net';

import { DevServerCoreConfig } from './DevServerCoreConfig';
import { createMiddleware } from './createMiddleware';
import { Logger } from '../logger/Logger';
import { addPlugins } from './addPlugins';

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
  logger: Logger,
  cfg: DevServerCoreConfig,
  fileWatcher: FSWatcher,
  middlewareMode = false,
) {
  const app = new Koa();
  app.silent = true;
  app.on('error', error => {
    if (['EPIPE', 'ECONNRESET', 'ERR_STREAM_PREMATURE_CLOSE'].includes(error.code)) {
      return;
    }

    console.error('Error while handling server request.');
    console.error(error);
  });
  addPlugins(logger, cfg);

  // special case the legacy plugin, if it is given make sure the resolve module imports plugin
  // runs before the legacy plugin because it compiles away module syntax. ideally we have a
  // generic API for this, but we need to design that a bit more first
  const indexOfLegacy = cfg.plugins!.findIndex(p => p.name === 'legacy');
  let indexOfResolve = cfg.plugins!.findIndex(p => p.name === 'resolve-module-imports');
  if (indexOfLegacy !== -1 && indexOfResolve !== -1) {
    const legacy = cfg.plugins!.splice(indexOfLegacy, 1)[0];
    // recompute after splicing
    indexOfResolve = cfg.plugins!.findIndex(p => p.name === 'resolve-module-imports');
    cfg.plugins!.splice(indexOfResolve, 1, cfg.plugins![indexOfResolve], legacy);
  }

  const middleware = createMiddleware(cfg, logger, fileWatcher);
  for (const m of middleware) {
    app.use(m);
  }

  if (middlewareMode) {
    return { app };
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
    server = http2Server.createSecureServer(options, app.callback());
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

    const wrapperServer = net.createServer(httpRedirectProxy);

    wrapperServer.addListener('close', () => {
      httpsRedirectServer.close();
      server.close();
    });

    wrapperServer.addListener('listening', () => {
      const info = server.address();
      if (!info || typeof info === 'string') {
        return;
      }
      const { address, port } = info;
      appServerPort = port + 1;
      httpsRedirectServerPort = port + 2;

      server.listen({ address, port: appServerPort });
      httpsRedirectServer.listen({ address, port: httpsRedirectServerPort });
    });

    const serverListen = wrapperServer.listen.bind(wrapperServer);
    (wrapperServer as any).listen = (config: ListenOptions, callback: () => void) => {
      server.addListener('listening', callback);
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
