# Test Runner >> Getting Started ||10

Testing your code is very important to have the confidence to release often.
Green tests should mean that the change is good to go 👍

## Writing my first test

We plan to write a utility function `sum` which sums up 2 parameters.
We start by defining on what we expect the code to do.

```js
it('sums up 2 numbers', () => {
  expect(sum(1, 1)).to.equal(2);
  expect(sum(3, 12)).to.equal(15);
});
```

👆 We make sure 1 + 1 equals 2 and 3 + 12 equals 15

Now that we know what we want we need to place this file somewhere and run a tool to execute this code in the browser automatically.

## Setup tools

1. Install the necessary packages

   ```
   npm i --save-dev @web/test-runner @esm-bundle/chai
   ```

2. Add a script to your `package.json`
   ```json
   {
     "scripts": {
       "test": "web-test-runner \"test/**/*.test.js\" --node-resolve"
     }
   }
   ```

With that we can now execute

```
npm run test
```

which results in the following output

```
$ web-test-runner "test/**/*.test.js" --node-resolve
Could not find any files with pattern(s): test/**/*.test.js
```

fair enough - we didn't create a test file yet.

## Make it work

1. Take the spec/test from above and create a test file `test/sum.test.js`.

   ```js
   import { expect } from '@esm-bundle/chai';
   import { sum } from '../src/sum.js';

   it('sums up 2 numbers', () => {
     expect(sum(1, 1)).to.equal(2);
     expect(sum(3, 12)).to.equal(15);
   });
   ```

   We also added the necessary imports

2. Run it

   ```
   $ npm run test
   $ web-test-runner test/**/*.test.js --node-resolve

   test/sum.test.js:

   🚧 404 network requests:
       - demo/guides/test-runner-getting-started/src/sum.js

   ❌ TypeError: Failed to fetch dynamically imported module: http://localhost:9685/demo/guides/test-runner-getting-started/test/sum.test.js

   Chrome: |██████████████████████████████| 1/1 test files | 0 passed, 0 failed
   ```

   => this is what we expected

3. Create the src file `src/sum.js`

   ```js
   export function sum(a, b) {}
   ```

   We will make sure to test if it fails correctly.

   ```
   $ npm run test
   $ web-test-runner test/**/*.test.js --node-resolve

   test/sum.test.js:

   ❌ sums up 2 numbers
         AssertionError: expected undefined to equal 2
           at n.<anonymous> (test/sum.test.js:5:24)

   Chrome: |██████████████████████████████| 1/1 test files | 0 passed, 1 failed
   ```

   => fails correctly

4. Fix it

   ```js
   export function sum(a, b) {
     return a + b;
   }
   ```

   ```
   $ web-test-runner test/**/*.test.js --node-resolve

   Chrome: |██████████████████████████████| 1/1 test files | 1 passed, 0 failed

   Finished running tests in 0.9s, all tests passed! 🎉
   ```

   Mission accomplished 💪

## Learn more

All the code is available on [github](https://github.com/modernweb-dev/example-projects/tree/master/guides/test-runner).
See the [documentation of @web/test-runner](../../docs/test-runner/overview.md).
