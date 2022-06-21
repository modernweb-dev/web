```js server
/* START - Rocket auto generated - do not touch */
// prettier-ignore
export const sourceRelativeFilePath = '20--docs/1--test-runner/4--test-frameworks/10--mocha.rocket.md';
import { html, layout, setupUnifiedPlugins, components } from '../../../recursive.data.js';
export { html, layout, setupUnifiedPlugins, components };
export async function registerCustomElements() {
  // server-only components
  // prettier-ignore
  customElements.define('rocket-social-link', await import('@rocket/components/social-link.js').then(m => m.RocketSocialLink));
  // prettier-ignore
  customElements.define('rocket-header', await import('@rocket/components/header.js').then(m => m.RocketHeader));
  // prettier-ignore
  customElements.define('main-docs', await import('@rocket/components/main-docs.js').then(m => m.MainDocs));
  // hydrate-able components
  // prettier-ignore
  customElements.define('rocket-search', await import('@rocket/search/search.js').then(m => m.RocketSearch));
  // prettier-ignore
  customElements.define('rocket-drawer', await import('@rocket/components/drawer.js').then(m => m.RocketDrawer));
}
/* END - Rocket auto generated - do not touch */
```

# Mocha

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
