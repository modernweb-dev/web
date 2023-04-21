# Test Runner >> Reporters >> Overview ||10

You can customize the test reporters using the `reporters` option.

```js
// import the browser launcher you want to use
import { defaultReporter } from '@web/test-runner';
import { myReporter } from 'my-reporter';

export default {
  reporters: [
    // use the default reporter only for reporting test progress
    defaultReporter({ reportTestResults: false, reportTestProgress: true }),
    // use another reporter to report test results
    myReporter(),
  ],
};
```
