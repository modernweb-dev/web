# Web Dev Server

Dev Server for web applications, ideal for buildless es module workflows. Optionally supports simple code transformations.

- Efficient browser caching for fast reloads
- Transform code on older browsers for compatibility
- Resolve bare module imports for use in the browser (--node-resolve)
- Auto-reload on file changes with the (--watch)
- History API fallback for SPA routing (--app-index index.html)
- Plugin and middleware API for extensions
- Powered by [esbuild](/docs/dev-server/plugins/esbuild.md) and [rollup plugins](/docs/dev-server/plugins/rollup.md)

> Web Dev server is the successor of [es-dev-server](https://www.npmjs.com/package/es-dev-server)

See [our website](https://modern-web.dev/docs/dev-server/overview/) for full documentation.

## Installation

Install the dev server:

```
npm i --save-dev @web/dev-server
```

## Basic commands

Start the dev server:

```
web-dev-server --node-resolve --open
wds --node-resolve --open
```

Run in watch mode, reloading on file changes:

```
web-dev-server --node-resolve --watch --open
wds --node-resolve --watch --open
```

Use history API fallback for SPA routing:

```
web-dev-server --node-resolve --app-index demo/index.html --open
wds --node-resolve --app-index demo/index.html --open
```

Transform JS to a compatible syntax based on user agent:

```
web-dev-server --node-resolve --open --esbuild-target auto
wds --node-resolve --open --esbuild-target auto
```

## Example projects

Check out the <a href="https://github.com/modernweb-dev/example-projects" target="_blank" rel="noopener noreferrer">example projects</a> for a fully integrated setup.

## Documentation

See [our website](https://modern-web.dev/docs/dev-server/overview/) for full documentation.
