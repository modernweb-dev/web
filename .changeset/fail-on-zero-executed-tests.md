---
'@web/test-runner-core': major
'@web/test-runner': major
---

A test run now fails when all test files loaded but no tests were executed, instead of silently passing with exit code 0. Skipped tests count as executed, and watch mode and manual mode are unaffected.

Restore the old behavior with the new `passWithNoTests` option or the `--pass-with-no-tests` CLI flag. Note that test sessions which do not report test results, for example from a custom test framework, are now treated as having executed zero tests.
