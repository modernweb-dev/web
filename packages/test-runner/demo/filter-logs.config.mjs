export default /** @type {import('@web/test-runner').TestRunnerConfig} */ ({
  files: ['demo/test/logging.test.js'],

  filterBrowserLogs(log) {
    return log.type === 'error';
  },
});
