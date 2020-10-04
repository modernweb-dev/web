import { Plugin, WebSocketsManager } from '@web/dev-server-core';
import type { ServerArgs } from '@web/dev-server-core/dist/Plugin';
import WebSocket from 'ws';
import type { Context } from 'koa';

export interface HmrReloadMessage {
  type: 'reload';
}

export interface HmrUpdateMessage {
  type: 'update';
  url: string;
}

export type HmrMessage = HmrReloadMessage | HmrUpdateMessage;

export interface HmrModule {
  dependencies: Set<string>;
  dependents: Set<string>;
  hmrAccepted: boolean;
  hmrEnabled: boolean;
}

export class HmrPlugin implements Plugin {
  name = 'hmr';
  injectWebSocket = true;

  protected _dependencyTree: Map<string, HmrModule> = new Map();
  protected _webSockets?: WebSocketsManager;

  async serverStart({ webSockets, fileWatcher }: ServerArgs) {
    if (!fileWatcher) {
      throw new Error('Cannot use HMR when watch mode is disabled.');
    }

    if (!webSockets) {
      throw new Error('Cannot use HMR when web sockets are disabled.');
    }

    this._webSockets = webSockets;

    webSockets.on('message', ({ webSocket, data }) => this._onMessage(webSocket, data));
    fileWatcher.on('change', path => this._onFileChanged(path));
    fileWatcher.on('unlink', path => this._onFileChanged(path));
  }

  async serve({ context }: { context: Context }) {
    // We are serving a new file or it has changed, so clear all the
    // dependencies we previously tracked (if any).
    this._clearDependencies(context.path);
  }

  async transformImport({ source, context }: { source: string, context: Context }) {
    const mod = this._getOrCreateModule(context.path);
    const dependencyMod = this._getOrCreateModule(source);

    mod.dependencies.add(source);
    dependencyMod.dependents.add(context.path);
  }

  async transform({ context }: { context: Context }) {
    // If the module references import.meta.hot it can be assumed it
    // supports hot reloading
    const hmrEnabled = context.body.includes('import.meta.hot') === true;
    const mod = this._getOrCreateModule(context.path);
    mod.hmrEnabled = hmrEnabled;
  }

  protected _clearDependencies(path: string): void {
    const mod = this._getModule(path);

    if (!mod) {
      return;
    }

    for (const dep of mod.dependencies) {
      const depMod = this._getModule(dep);
      if (depMod) {
        depMod.dependents.delete(path);
      }
    }

    mod.dependencies = new Set();
  }

  serverStop() {
    this._webSockets = undefined;
  }

  protected _onFileChanged(path: string): void {
    // If we know what this module is, we can try trigger a HMR update
    if (this._hasModule(path)) {
      this._triggerUpdate(path);
      return;
    }

    // Otherwise we reload the page
    this._broadcast({ type: 'reload' });
  }

  protected _triggerUpdate(path: string, visited: Set<string> = new Set()): void {
    // We already visited this module
    if (visited.has(path)) {
      return;
    }

    const mod = this._getModule(path);
    visited.add(path);

    // We're not aware of this module so can't handle it
    if (!mod) {
      this._broadcast({type: 'reload' });
      return;
    }

    // The module supports HMR so lets tell it to update
    if (mod.hmrEnabled) {
      this._broadcast({ type: 'update', url: path });
    }

    // The module has already been dealt with already
    if (mod.hmrAccepted) {
      return;
    }

    // Trigger an update for every module that depends on this one
    if (mod.dependents.size > 0) {
      for (const dep of mod.dependents) {
        this._triggerUpdate(dep, visited);
      }
      return;
    }

    // Nothing left to try
    this._broadcast({type: 'reload' });
  }

  protected _broadcast(message: HmrMessage): void {
    if (!this._webSockets) {
      return;
    }

    this._webSockets.send(JSON.stringify(message), 'esm-hmr');
  }

  protected _hasModule(path: string): boolean {
    return this._dependencyTree.has(path);
  }

  protected _onMessage(socket: WebSocket, data: WebSocket.Data): void {
    // Only handle HMR requests
    if (socket.protocol !== 'esm-hmr') {
      return;
    }

    const message = JSON.parse(data.toString());

    if (message.type === 'hotAccept') {
      const mod = this._getOrCreateModule(message.id);
      mod.hmrAccepted = true;
      mod.hmrEnabled = true;
    }
  }

  protected _getOrCreateModule(path: string): HmrModule {
    // TODO (43081j): some kind of normalisation of the paths?
    const mod = this._getModule(path);

    return mod ?? this._createModule(path);
  }

  protected _getModule(path: string): HmrModule | null {
    const mod = this._dependencyTree.get(path);

    return mod ?? null;
  }

  protected _createModule(path: string): HmrModule {
    const mod: HmrModule = {
      hmrAccepted: false,
      hmrEnabled: false,
      dependencies: new Set(),
      dependents: new Set(),
    };
    this._dependencyTree.set(path, mod);
    return mod;
  }
}
