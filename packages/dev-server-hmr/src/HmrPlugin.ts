import type { Plugin, WebSocketsManager, Logger, WebSocketData, ServerStartParams } from '@web/dev-server-core';
import { appendHtmlToDocument } from '@web/dev-server-core';
import WebSocket from 'ws';
import type { Context } from 'koa';
import {hmrClientScript} from './hmrClientScript';

export interface HmrReloadMessage {
  type: 'reload';
}

export interface HmrUpdateMessage {
  type: 'update';
  url: string;
}

export interface HmrAcceptMessage extends WebSocketData {
  type: 'hotAccept';
  id: string;
}

export type HmrMessage = HmrReloadMessage | HmrUpdateMessage;

export type HmrClientMessage = HmrAcceptMessage;

export interface HmrModule {
  dependencies: Set<string>;
  dependents: Set<string>;
  hmrAccepted: boolean;
  hmrEnabled: boolean;
}

export const NAME_HMR_CLIENT_IMPORT = '/__web-dev-server__hmr.js';

export const hmrClientImport = `<!-- injected by web-dev-server -->
<script type="module" src="${NAME_HMR_CLIENT_IMPORT}"></script>`;

/**
 * Dev server plugin to provide hot module reloading
 */
export class HmrPlugin implements Plugin {
  name = 'hmr';
  injectWebSocket = true;

  protected _dependencyTree: Map<string, HmrModule> = new Map();
  protected _webSockets?: WebSocketsManager;
  protected _logger?: Logger;

  /** @inheritDoc */
  async serverStart({ webSockets, fileWatcher, logger }: ServerStartParams) {
    if (!fileWatcher) {
      throw new Error('Cannot use HMR when watch mode is disabled.');
    }

    if (!webSockets) {
      throw new Error('Cannot use HMR when web sockets are disabled.');
    }

    this._webSockets = webSockets;
    this._logger = logger;

    webSockets.on('message', ({ webSocket, data }) => this._onMessage(webSocket, data));
    fileWatcher.on('change', path => this._onFileChanged(path));
    fileWatcher.on('unlink', path => this._onFileChanged(path));

    this._logger?.debug('[hmr] Listening for HMR messages');
  }

  /** @inheritDoc */
  async serve(context: Context) {
    // Someone is requesting the injected client script
    if (context.path === NAME_HMR_CLIENT_IMPORT) {
      return hmrClientScript;
    }

    // We are serving a new file or it has changed, so clear all the
    // dependencies we previously tracked (if any).
    this._clearDependencies(context.path);
    this._logger?.debug(`[hmr] Cleared dependency tree cache of ${context.path}`);
  }

  /** @inheritDoc */
  async transformImport({ source, context }: { source: string; context: Context }) {
    const mod = this._getOrCreateModule(context.path);
    const dependencyMod = this._getOrCreateModule(source);

    mod.dependencies.add(source);
    dependencyMod.dependents.add(context.path);
    this._logger?.debug(`[hmr] Added dependency from ${context.path} -> ${source}`);
  }

  /** @inheritDoc */
  async transform(context: Context) {
    if (context.response.is('html')) {
      return appendHtmlToDocument(context, hmrClientImport);
    }

    // If the module references import.meta.hot it can be assumed it
    // supports hot reloading
    const hmrEnabled = context.body.includes('import.meta.hot') === true;
    const mod = this._getOrCreateModule(context.path);
    mod.hmrEnabled = hmrEnabled;
    this._logger?.debug(`[hmr] Setting hmrEnabled=${hmrEnabled} for ${context.path}`);

    if (hmrEnabled && context.response.is('application/javascript')) {
      return `
        import {create as __WDS_HMR__} from '${NAME_HMR_CLIENT_IMPORT}';
        import.meta.hot = __WDS_HMR__(import.meta.url);
        ${context.body}
      `;
    }
  }

  /**
   * Clears the dependency cache/tree of a particular module
   * @param path Module path to clear
   */
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

  /** @inheritDoc */
  serverStop() {
    this._webSockets = undefined;
  }

  /**
   * Fired when a file has changed.
   * @param path Module path which has changed
   */
  protected _onFileChanged(path: string): void {
    // If we know what this module is, we can try trigger a HMR update
    if (this._hasModule(path)) {
      this._triggerUpdate(path);
      return;
    }

    // Otherwise we reload the page
    this._broadcast({ type: 'reload' });
  }

  /**
   * Triggers an update for a given module.
   * This will result in the client being sent a message to tell them
   * how to deal with this module updating.
   * @param path Module path to update
   * @param visited Modules already updated (cache)
   */
  protected _triggerUpdate(path: string, visited: Set<string> = new Set()): void {
    // We already visited this module
    if (visited.has(path)) {
      return;
    }

    const mod = this._getModule(path);
    visited.add(path);

    // We're not aware of this module so can't handle it
    if (!mod) {
      this._broadcast({ type: 'reload' });
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
    this._broadcast({ type: 'reload' });
  }

  /**
   * Broadcasts a HMR message to the client
   * @param message HMR message to emit
   */
  protected _broadcast(message: HmrMessage): void {
    if (!this._webSockets) {
      return;
    }

    this._logger?.debug(`[hmr] emitting ${message.type} message`);
    this._webSockets.send(JSON.stringify(message), 'esm-hmr');
  }

  /**
   * Determines if the dependency tree already has a given module
   * @param path Module path to check
   */
  protected _hasModule(path: string): boolean {
    return this._dependencyTree.has(path);
  }

  /**
   * Fired when a message is received from a client
   * @param socket Socket the message was received on
   * @param message Message received
   */
  protected _onMessage(socket: WebSocket, data: WebSocketData): void {
    // Only handle HMR requests
    if (socket.protocol !== 'esm-hmr') {
      return;
    }

    const message = data as HmrClientMessage;

    if (message.type === 'hotAccept') {
      const mod = this._getOrCreateModule(message.id);
      mod.hmrAccepted = true;
      mod.hmrEnabled = true;
    }
  }

  /**
   * Retrieves a module from the cache and creates it if it does not
   * exist already.
   * @param path Module path to retrieve
   */
  protected _getOrCreateModule(path: string): HmrModule {
    // TODO (43081j): some kind of normalisation of the paths?
    const mod = this._getModule(path);

    return mod ?? this._createModule(path);
  }

  /**
   * Retrieves a module from the cache if it exists
   * @param path Module path to retrieve
   */
  protected _getModule(path: string): HmrModule | null {
    const mod = this._dependencyTree.get(path);

    return mod ?? null;
  }

  /**
   * Creates a module and initialises the dependency tree cache entry
   * for it.
   * @param path Module path to create an entry for
   */
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
