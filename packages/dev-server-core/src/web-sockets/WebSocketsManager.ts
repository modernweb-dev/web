import { Server } from 'net';
import WebSocket from 'ws';
import { EventEmitter } from './EventEmitter';

export const NAME_WEB_SOCKET_IMPORT = '/__web-dev-server__web-socket.js';

export interface Events {
  message: { webSocket: WebSocket; data: WebSocket.Data };
}

/**
 * Manages web sockets. When the browser opens a web socket connection, the socket is stored
 * until it is disconnected. The dev server or plugins can then send messages to the browser.
 */
export class WebSocketsManager extends EventEmitter<Events> {
  public webSocketImport = NAME_WEB_SOCKET_IMPORT;
  private webSocketServer: WebSocket.Server;
  private openSockets = new Set<WebSocket>();

  constructor(server: Server) {
    super();

    this.webSocketServer = new WebSocket.Server({ noServer: true });
    this.webSocketServer.on('connection', webSocket => {
      this.openSockets.add(webSocket);
      webSocket.on('close', () => {
        this.openSockets.delete(webSocket);
      });

      webSocket.on('message', data => {
        this.emit('message', { webSocket, data });
      });
    });

    server.on('upgrade', (request, socket, head) => {
      this.webSocketServer.handleUpgrade(request, socket, head, ws => {
        this.webSocketServer.emit('connection', ws, request);
      });
    });
  }

  /**
   * Imports the given path, executing the module as well as a default export if it executes a function.
   *
   * This is a built-in web socket message and will be handled automatically.
   *
   * @param importPath the path to import
   * @param args optional args to pass to the function that is called.
   */
  sendImport(importPath: string, args: unknown[] = []) {
    this.send(JSON.stringify({ type: 'import', data: { importPath, args } }));
  }

  /**
   * Logs a message to the browser console of all connected web sockets.
   *
   * This is a built-in web socket message and will be handled automatically.
   *
   * @param text message to send
   */
  sendConsoleLog(text: string) {
    this.sendImport(`data:text/javascript,console.log(${JSON.stringify(text)});`);
  }

  /**
   * Sends messages to all connected web sockets.
   *
   * @param message
   */
  send(message: string) {
    for (const socket of this.openSockets) {
      if (socket.readyState === socket.OPEN) {
        socket.send(message);
      }
    }
  }
}
