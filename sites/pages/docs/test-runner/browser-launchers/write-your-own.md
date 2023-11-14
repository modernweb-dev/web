# Test Runner >> Browser Launchers >> Write Your Own ||90

A browser launcher handles booting up or connecting to a browser, visiting a URL and closing the browser when tests finish.

If you want to implement your own browser launcher, it's best to look at the [interface in the source code](https://github.com/modernweb-dev/web/blob/master/packages/test-runner-core/src/browser-launcher/BrowserLauncher.ts).

For a reference implementation, you can take a look at [@web/test-runner-chrome](https://github.com/modernweb-dev/web/tree/master/packages/test-runner-chrome).
