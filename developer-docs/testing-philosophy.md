The Modern Web repository has a lot of tests. As the repository matures it's essential to have a reliable test suite so that changes are less likely to break existing features.

One aspect where tests become unreliable is in regards to test execution time. Completing a single run of the node tests for the modern web project takes around 2 minutes. 2 minutes might not sound like a lot but it's enough to take a developer out of the flow state[^flow-state] while developing.

The project would benefit from having high quality tests that run fast to provide a tight feedback loop while changing the code in the repository.

## Plan of action

In order to get the project started towards having tests that run fast, the tests are now split up into “slow” and “fast” tests. To include a test in the slow test suite, the name of the test needs to include the `@slow` mocha tag[^mocha-tags].

Fast tests are slow when they take 100 ms to run and timeout at 200 ms. Tests that exceeds the fast test timeout limit are slow while all others tests are fast. Developers should write as tests fast tests where ever possible and only drop-down to the slow test suite when the alternative is impossible.

The ultimate state of the test suite is to contain roughly 70% fast tests and 30% slow tests. The fast test run as part of the developer feedback loop and the slower slow tests can run either right before pushing to source control, or as part of a CI run before publishing the changes.

Over time slow tests change to be fast wherever possible. Most slow tests are slow due to arbitrary waiting for time or other time wasting operations. These tests can be fast with some minimal refactoring.

## Conclusion

A fast developer feedback loop is essential for making changes to a aging project. Therefor tests need to run fast. The Modern Web project aims for a 70/30 split of fast and slow tests[^fast-slow-unit-integration]. The Modern Web project provides linters and checks to help developers write fast tests as much as possible.

[^fast-slow-unit-integration]: Unit and integration tests if you prefer.
[^mocha-tags]: https://github.com/mochajs/mocha/wiki/Tagging
[^flow-state]: https://en.wikipedia.org/wiki/Flow_(psychology)
