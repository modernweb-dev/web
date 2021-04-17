# Test Runner >> Commands ||6

Commands for executing code server-side during your tests in the browser. To control the browser page, access the file system, or execute NodeJS libraries.

Built-in commands can change the viewport, emulate media queries or set the user agent. You can create custom commands to implement your own functionalities.

## Usage

Install the library:

```
npm i --save-dev @web/test-runner-commands
```

## Built-in commands

You can use the built-in commands directly in your tests.

### Accessibility Snapshot

The `a11ySnapshot` command requests a snapshot of the accessibility tree built in the browser representing the current page or the tree rooter by the passed `selector` property. The function is async and should be awaited.

`a11ySnapshot` is supported in `@web/test-runner-chrome`, `-puppeteer` and `-playwright`.

<details>
<summary>View example</summary>

```js
import { a11ySnapshot, findAccessibilityNode } from '@web/test-runner-commands';

it('returns an accessibility tree with appropriately labelled element in it', async () => {
  const buttonText = 'Button Text';
  const labelText = 'Label Text';
  const fullText = `${labelText} ${buttonText}`;
  const role = 'button';

  const label = document.createElement('label');
  label.textContent = labelText;
  label.id = 'label';
  const button = document.createElement('button');
  button.textContent = buttonText;
  button.id = 'button';
  button.setAttribute('aria-labelledby', 'label button');
  document.body.append(label, button);

  const snapshot = await a11ySnapshot();
  const foundNode = findAccessibilityNode(
    snapshot,
    node => node.name === fullText && node.role === role,
  );
  expect(foundNode, 'A node with the supplied name has been found.').to.not.be.null;

  label.remove();
  button.remove();
});
```

</details>

### Emulate media

The `emulateMedia` command allows changing browser media queries. The function is async and should be awaited.

`emulateMedia` is supported in `@web/test-runner-chrome`, `-puppeteer` and `-playwright`. The `reducedMotion` option is not supported by playwright.

<details>
<summary>View example</summary>

```js
import { emulateMedia } from '@web/test-runner-commands';

it('can emulate print media type', async () => {
  await emulateMedia({ media: 'print' });
  expect(matchMedia('print').matches).to.be.true;
  await emulateMedia({ media: 'screen' });
  expect(matchMedia('screen').matches).to.be.true;
});

it('can emulate color scheme', async () => {
  await emulateMedia({ colorScheme: 'dark' });
  expect(matchMedia('(prefers-color-scheme: dark)').matches).to.be.true;
  await emulateMedia({ colorScheme: 'light' });
  expect(matchMedia('(prefers-color-scheme: light)').matches).to.be.true;
});

// The reducedMotion option is not supported by playwright.
it('can emulate reduced motion', async () => {
  await emulateMedia({ reducedMotion: 'reduce' });
  expect(matchMedia('(prefers-reduced-motion: reduce)').matches).to.be.true;
  await emulateMedia({ reducedMotion: 'no-preference' });
  expect(matchMedia('(prefers-reduced-motion: no-preference)').matches).to.be.true;
});
```

</details>

### Send keys

The `sendKeys` command will cause the browser to `press` or `type` keys as if it received those keys from the keyboard. This greatly simplifies interactions with form elements during test and surfaces the ability to directly inspect the way focus flows through test content in response to the `Tab` key. The function is async and should be awaited.

`sendKeys` is supported in `@web/test-runner-chrome`, `-puppeteer` and `-playwright`.

<details>
<summary>View example</summary>

```js
import { sendKeys } from '@web/test-runner-commands';

it('natively presses `Tab`', async () => {
  const input1 = document.createElement('input');
  const input2 = document.createElement('input');
  document.body.append(input1, input2);
  input1.focus();
  expect(document.activeElement).to.equal(input1);

  await sendKeys({
    press: 'Tab',
  });

  expect(document.activeElement).to.equal(input2);
  input1.remove();
  input2.remove();
});
```

</details>

### Set user agent

The `setUserAgent` command changes the browser's user agent. The function is async and should be awaited.

`setUserAgent` is supported in `@web/test-runner-chrome` and `-puppeteer`

<details>
<summary>View example</summary>

```js
import { setUserAgent } from '@web/test-runner-commands';

it('can set the user agent', async () => {
  const userAgent = 'my custom user agent';
  expect(navigator.userAgent).to.not.equal(userAgent);
  await setUserAgent(userAgent);
  expect(navigator.userAgent).to.equal(userAgent);
});
```

</details>

### Viewport

The `setViewport` command allows changing the browser's viewport in a test. The function is async and should be awaited.

`setViewport` is supported in `@web/test-runner-chrome`, `-puppeteer` and `-playwright`.

<details>
  <summary>View example</summary>

```js
import { setViewport } from '@web/test-runner-commands';

describe('my component', () => {
  it('works on 360x640', async () => {
    await setViewport({ width: 360, height: 640 });
    console.log(window.innerWidth); // 360
    console.log(window.innerHeight); // 640
  });

  it('works on 400x800', async () => {
    await setViewport({ width: 400, height: 800 });
    console.log(window.innerWidth); // 400
    console.log(window.innerHeight); // 800
  });
});
```

</details>

## Custom commands

To create a custom command, you first need to add a test runner plugin which implements the `executeCommand` function.

This function receives the currently executing command, optional command payload from the browser, and the associated test session. The command runs on the server, giving you access to things like the browser launcher, file system, or any NodeJS libraries you want to use.

By returning a non-null or undefined value from this function, the test runner will assume you have processed it, not call any other plugins and return the return value to the browser. The function can be async.

<details>

<summary>View example</summary>

```js
import fs from 'fs';

function myPlugin() {
  return {
    name: 'my-plugin',

    executeCommand({ command, payload }) {
      if (command === 'my-command') {
        // write the data receives from the browser to a disk
        fs.writeFileSync('./my-file.json', JSON.stringify(payload));
        // by returning a value, we signal the test runner we've handled this command
        return true;
      }
    },
  };
}

// your web-test-runner.config.js
export default {
  plugins: [myPlugin()],
};
```

</details>

The `executeCommand` function receives the current test session, you can use this to access the browser launcher instance for advanced functionalities not available from the browser. Because there are different kinds of browser launchers, you need to use the `type` property to adjust the behavior of your plugin.

<details>
<summary>View example</summary>

```js
export function takeScreenshotPlugin() {
  return {
    name: 'take-screen-command',

    async executeCommand({ command, payload, session }) {
      if (command === 'take-screenshot') {
        // handle specific behavior for puppeteer
        if (session.browser.type === 'puppeteer') {
          const page = session.browser.getPage(session.id);
          const screenshot = await page.screenshot();
          // do something with the screenshot
          return true;
        }

        // handle specific behavior for playwright
        if (session.browser.type === 'playwright') {
          const page = session.browser.getPage(session.id);
          const screenshot = await page.screenshot();
          // do something with the screenshot
          return true;
        }

        // you might not be able to support all browser launchers
        throw new Error(
          `Taking screenshots is not supported for browser type ${session.browser.type}.`,
        );
      }
      return false;
    },
  };
}
```

</details>

After implementing your plugin, it can be called from the browser using the `executeServerCommand` function. Any data passed in the second parameter is received by the server plugin. It should be serializable to JSON.

<details>
<summary>View example</summary>

```js
import { executeServerCommand } from '@web/test-runner-commands';

it('my test', async () => {
  await executeServerCommand('my-command');
  // optionally pass in serializable data
  await executeServerCommand('my-command', { foo: 'bar' });
});
```

</details>
