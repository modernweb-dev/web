# Test Runner >> Getting Started ||10

Code tests give you the confidence to release often.
If all the tests pass, the change is likely good to go 👍

But... it is just as important to test that your test code fails if things are *not* right.
That's why the initial failures (below) are expected:
we write all the test scaffolding before writing the function that "does the work."

## Writing the first test

We plan to write a utility function `sum` which sums up 2 parameters.
We start by defining a "specification" that tells what we expect the code to do.

```js
it('sums up 2 numbers', () => {
  expect(sum(1, 1)).to.equal(2);
  expect(sum(3, 12)).to.equal(15);
});
```

👆 The code above calls `sum()` with the specified values, and tests that 1 + 1 equals 2 and 3 + 12 equals 15

Now that we know what we want, we need to place this code somewhere and run a tool to execute this code automatically.
*Note: we haven't actually created this test file yet. Keep reading...*

## Setup the tools

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

3. Test it by running...

   ```
   npm run test
   ```

   which results in the following output

   ```
   $ web-test-runner "test/**/*.test.js" --node-resolve
   Could not find any files with pattern(s): test/**/*.test.js
   ```

   *=> There's an error. Fair enough - we didn't create a test file yet.*

## Making it work

1. Create a test file `test/sum.test.js`, add the specification from above and the necessary imports.

   ```js
   import { expect } from '@esm-bundle/chai';
   import { sum } from '../src/sum.js';

   it('sums up 2 numbers', () => {
     expect(sum(1, 1)).to.equal(2);
     expect(sum(3, 12)).to.equal(15);
   });
   ```

2. Test it

   ```
   $ npm run test
   $ web-test-runner test/**/*.test.js --node-resolve

   test/sum.test.js:

   🚧 404 network requests:
       - demo/guides/test-runner-getting-started/src/sum.js

   ❌ TypeError: Failed to fetch dynamically imported module: http://localhost:9685/demo/guides/test-runner-getting-started/test/sum.test.js

   Chrome: |██████████████████████████████| 1/1 test files | 0 passed, 0 failed
   ```

   *=> Good! The "404 network requests" error is expected - we haven't created the `sum.js` file yet.*

3. Create the src file `src/sum.js` with an *empty* function body (so it will fail)

   ```js
   export function sum(a, b) {}
   ```

   And then test it... 

   ```
   $ npm run test
   $ web-test-runner test/**/*.test.js --node-resolve

   test/sum.test.js:

   ❌ sums up 2 numbers
         AssertionError: expected undefined to equal 2
           at n.<anonymous> (test/sum.test.js:5:24)

   Chrome: |██████████████████████████████| 1/1 test files | 0 passed, 1 failed
   ```

   *=> Good! It fails correctly, since the `sum()` function returns undefined*

4. Fix it, and test again...

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

   *=> Good! All tests passed! Mission accomplished 💪*

## Learn more

All the code is available on [github](https://github.com/modernweb-dev/example-projects/tree/master/guides/test-runner).
See the [documentation of @web/test-runner](../../docs/test-runner/overview.md).
