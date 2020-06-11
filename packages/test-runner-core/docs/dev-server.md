# Dev server

While it is technically possible to implement your own dev server, for most cases it would be easier to use the [default server](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-dev-server) and set up a proxy or plugin to delegate work to other servers or compilers.

If you want to implement your own server, it's best to look at the [interface in the source code](../src/server/Server.ts).

For a reference implementation, you can take a look at [@web/test-runner-dev-server](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-dev-server)
