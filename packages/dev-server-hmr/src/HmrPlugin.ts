import { Plugin, WebSocketsManager } from '@web/dev-server-core';
import type { ServerArgs } from '@web/dev-server-core/dist/Plugin';
import WebSocket from 'ws';

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

  async transformImport({ source, code }: { source: string, code?: string }) {
    const hmrEnabled = code?.includes('import.meta.hot') === true;
    const imports: string[] = []; // TODO (43081j): get these from somewhere
    this._setModule(source, imports, hmrEnabled);
  }

  protected _setModule(path: string, dependencies: string[], hmrEnabled: boolean): void {
    const mod = this._getOrCreateModule(path);
    const oldDependencies = new Set(mod.dependencies);
    mod.hmrEnabled = hmrEnabled;

    for (const dep of dependencies) {
      mod.dependencies.add(dep);
      oldDependencies.delete(dep);

      const depMod = this._getOrCreateModule(dep);
      depMod.dependents.add(path);
    }

    for (const dep of oldDependencies) {
      mod.dependencies.delete(dep);

      const depMod = this._getModule(dep);
      if (depMod) {
        depMod.dependents.delete(path);
      }
    }
  }

  serverStop() {
    this._webSockets = undefined;
  }

  protected _onFileChanged(path: string): void {
    if (this._hasModule(path)) {
      this._triggerUpdate(path);
      return;
    }

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

    if (mod.hmrEnabled) {
      this._broadcast({ type: 'update', url: path });
    }

    // The module has already been dealt with
    if (mod.hmrAccepted) {
      return;
    }

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
