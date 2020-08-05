---
title: Taking code coverage into account
eleventyNavigation:
  key: Code Coverage
  parent: Test Runner
  order: 50
---

Once you have a decent set of tests you may want to look into what could still be improved.
Code coverage can help to find which code segments have not yet been tested.
Generally it's advised to have a code coverage above 80% which you will definitely have if you do test driven development.

## Getting the test coverage

Coverage is part of the default feature set that comes with the any launcher that works with chromium.

The reason for that is that the chromium browser itself calculates the coverage for us.

1. Add a script to your `package.json`
   ```json
   {
     "scripts": {
       "test": "web-test-runner \"test/**/*.test.js\" --node-resolve --coverage"
     }
   }
   ```

After you did run this test you will get something like this.

## Analyzing test coverage

You should open up the details at ...

## Learn more

See the [documentation of @web/test-runner](../../docs/test-runner/overview.md).
