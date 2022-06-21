# Test Runner >> Test Frameworks >> Mocha ||10

Test framework implementation of [Mocha](https://mochajs.org/).

## Writing JS tests

Mocha relies on global variables, in any JS test file `describe` and `it` are available globally and can be used directly:

```js
describe('my test', () => {
  it('foo is bar', () => {
    if ('foo' !== 'bar') {
      throw new Error('foo does not equal bar');
    }
  });
});
```

## Writing HTML tests

If you're writing tests as HTML, you can import this library to run tests with mocha:

```html
<html>
  <body>
    <script type="module">
      import { mocha, sessionFinished, sessionFailed } from '@web/test-runner-mocha';

      try {
        // setup mocha
        mocha.setup({ ui: 'bdd' });

        // write your tests inline
        describe('HTML tests', () => {
          it('works', () => {
            expect('foo').to.equal('foo');
          });
        });

        // or import your test file
        await import('./my-test.js');

        // run the tests, and notify the test runner after finishing
        mocha.run(() => {
          sessionFinished();
        });
      } catch (error) {
        console.error(error);
        // notify the test runner about errors
        sessionFailed(error);
      }
    </script>
  </body>
</html>
```

## Configuring mocha options

You can configure mocha options using the `testFramework.config` option in your `web-test-runner.config.js`:

```js
module.exports = {
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: '2000',
    },
  },
};
```
