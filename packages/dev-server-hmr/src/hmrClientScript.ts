import type {
  WebSocketsManager,
} from '@web/dev-server-core';

export const hmrClientScript = (socketManager: WebSocketsManager) => `
import {webSocket, sendMessage} from '${socketManager.webSocketImport}';

const modules = new Map();
const disposeTrigger = Symbol('trigger.dispose');
const acceptTrigger = Symbol('trigger.accept');
const disposeHandlers = Symbol('handlers.dispose');
const acceptHandlers = Symbol('handlers.accept');
const moduleState = Symbol('moduleState');
const HmrState = {
  None: 0,
  Declined: 1,
  Accepted: 2
};

export class HotModule {
  constructor(id) {
    this.id = id;
    this.data = {};
    this[disposeHandlers] = new Set();
    this[acceptHandlers] = new Set();
    this[moduleState] = HmrState.None;
  }

  accept(deps, callback) {
    if (this[moduleState] !== HmrState.Accepted) {
      sendMessage({ type: 'hmr:accept', id: this.id });
      this[moduleState] = HmrState.Accepted;
    }

    if (!callback) {
      callback = deps;
      deps = [];
    }

    this[acceptHandlers].add([
      deps,
      callback
    ]);
  }

  dispose(handler) {
    this[disposeHandlers].add(handler);
  }

  decline() {
    this[moduleState] = HmrState.Declined;
  }

  invalidate() {
    window.location.reload();
  }

  [disposeTrigger]() {
    const handlers = this[disposeHandlers];

    this.data = {};
    this[disposeHandlers] = new Set();

    for (const handler of handlers) {
      handler();
    }
  }

  async [acceptTrigger]() {
    if (this[moduleState] === HmrState.Declined) {
      return;
    }

    const time = Date.now();
    const handlers = [...this[acceptHandlers]];
    const results = await Promise.all(handlers.map(([depPaths, callback]) =>
      Promise.all([
        Promise.resolve(callback),
        import(\`\${this.id}?m=\${time}\`),
        ...depPaths.map((path) => import(\`\${path}?m=\${time}\`))
    ])));

    for (const [callback, module, ...deps] of results) {
      if (callback) {
        callback({deps, module});
      }
    }
  }
}

export function create(url) {
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  const existing = modules.get(path);

  if (existing) {
    existing[disposeTrigger]();
  }

  const instance = new HotModule(path);

  modules.set(path, instance);

  return instance;
}

webSocket.addEventListener('message', (e) => {
  try {
    const message = JSON.parse(e.data);
    if (message.type === 'hmr:reload') {
      window.location.reload();
    } else if (message.type === 'hmr:update') {
      const module = modules.get(message.url);
      if (module) {
        module[acceptTrigger]();
      }
    }
  } catch (error) {
    console.error('[hmr] Error while handling websocket message.');
    console.error(error);
  }
});
`;
