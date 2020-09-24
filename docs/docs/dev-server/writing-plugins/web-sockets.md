# Dev Server >> Writing Plugins >> Web Sockets ||4

The dev server has a web socket API for communicating with the browser. To use web sockets, your plugin must set the `injectWebSocket` option to `true`. If one plugin has this option set, a web socket script will be injected into the pages server by the dev server.

After setting the option, the server will pass the connected web sockets to the `serverStart` hook.

<details>
<summary>Read more</summary>

```js
function myPlugin() {
  return {
    name: 'my-plugin',
    injectWebSocket: true,
    serverStart({ webSockets }) {
      // print a console.log in the browser after 1sec
      setTimeout(() => {
        webSockets.sendConsoleLog('my-plugin', 'Hello world!');
      }, 1000);
    },
  };
}

export default {
  plugins: [myPlugin()],
};
```

</details>
&nbsp;

### Built-in messages

The web sockets manager has two built-in messages. `sendConsoleLog` is shown above, and will log any message to the browser console.

Another built-in message is `sendImport`. This will send a module path to be imported by the browser. You can use this to execute code in the browser.

<details>
<summary>Read more</summary>

In this example, `/foo.js`, will be imported in the browser using a dynamic import. The imported file can be a real file on the file system or a virtual file served by your plugin.

The module should have a default export, this is called each time `sendImport` is called.

```js
function myPlugin() {
  let webSockets;
  return {
    name: 'my-plugin',
    injectWebSocket: true,
    serverStart(options) {
      ({ webSockets } = options);

      setTimeout(() => {
        // this will import /foo.js in the browser
        webSockets.sendImport('/foo.js');
      }, 1000);
    },

    serve(context) {
      // you can serve a virtual module to be imported
      if (context.path === '/foo.js') {
        return 'export default () => console.log("/foo.js");';
      }
    },
  };
}
```

You can pass parameters to the function in the browser with the third parameter of the `sendImport` function.

```js
function myPlugin() {
  let webSockets;
  return {
    name: 'my-plugin',
    injectWebSocket: true,
    serverStart(options) {
      ({ webSockets } = options);

      setTimeout(() => {
        // this will import /foo.js in the browser
        webSockets.sendImport('/foo.js', ['a', 'b', 'c']);
      }, 1000);
    },

    serve(context) {
      // you can serve a virtual module to be imported
      if (context.path === '/foo.js') {
        return 'export default (...args) => console.log(...args);';
      }
    },
  };
}
```

If the code you want to execute is very simple, you can also send the import as a data URL. Data URLs are valid import paths, and very useful for this use case.

```js
function myPlugin() {
  let webSockets;
  return {
    name: 'my-plugin',
    injectWebSocket: true,
    serverStart(options) {
      ({ webSockets } = options);

      setTimeout(() => {
        // this will reload the browser
        webSockets.sendImport('data:text/javascript,window.location.reload()');
      }, 1000);
    },
  };
}
```

</details>
&nbsp;

### Custom messages

To send custom messages to opened web sockets you can use the `send` method.

<details>
<summary>Read more</summary>

```js
function myPlugin() {
  return {
    name: 'my-plugin',
    injectWebSocket: true,
    serverStart({ webSockets }) {
      setTimeout(() => {
        // this will send a message to all opened web sockets
        // the message must be parsable as JSON
        webSockets.send(JSON.stringify({ type: 'x' }));
      }, 1000);
    },
  };
}
```

</details>
&nbsp;

To respond to messages from the browser, you can listen to the `message` event from the web socket manager.

<details>
<summary>Read more</summary>

```js
function myPlugin() {
  return {
    name: 'my-plugin',
    injectWebSocket: true,
    serverStart({ webSockets }) {
      webSockets.on('message', ({ webSocket, data }) => {
        console.log('received message', data);
        webSocket.send('message response');
      });
    },
  };
}
```

</details>
&nbsp;

The message event provides the web socket that fired the event. You can use this to keep track of which sockets send which messages and send messages to specific sockets.
