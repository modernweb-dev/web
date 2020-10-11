export const hmrClientScript = `
export const webSocket = ('WebSocket' in window) ?
  new WebSocket(\`ws\${location.protocol === 'https:' ? 's': ''}://\${location.host}\`, 'esm-hmr') : null;

const pendingMessages = new Set();
const sendMessage = (message) => {
  if (!webSocket) {
    return;
  }

  if (webSocket.readyState !== webSocket.OPEN) {
    pendingMessages.add(message);
  } else {
    webSocket.send(JSON.stringify(message));
  }
};

const modules = new Map();
const disposeTrigger = Symbol('trigger.dispose');
const acceptTrigger = Symbol('trigger.accept');
const disposeHandlers = Symbol('handlers.dispose');
const acceptHandlers = Symbol('handlers.accept');
const moduleState = Symbol('moduleState');
const hmrState = {
  NONE: 0,
  DECLINED: 1,
  ACCEPTED: 2
};

export class HotModule {
  constructor(id) {
    this.id = id;
    this.data = {};
    this[disposeHandlers] = new Set();
    this[acceptHandlers] = new Set();
    this[moduleState] = hmrState.NONE;
  }

  accept(deps, callback) {
    if (this[moduleState] !== hmrState.ACCEPTED) {
      sendMessage({ type: 'hotAccept', id: this.id });
      this[moduleState] = hmrState.ACCEPTED;
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
    this[moduleState] = hmrState.DECLINED;
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
    if (this[moduleState] === hmrState.DECLINED) {
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

if (webSocket) {
  webSocket.addEventListener('open', () => {
    for (const message of pendingMessages) {
      sendMessage(message);
    }
    pendingMessages.clear();
  });
  webSocket.addEventListener('message', (e) => {
    try {
      const message = JSON.parse(e.data);
      if (message.type === 'reload') {
        window.location.reload();
      } else if (message.type === 'update') {
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
}
`;
