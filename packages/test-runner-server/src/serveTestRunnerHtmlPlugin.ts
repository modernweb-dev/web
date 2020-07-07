import { Context } from '@web/dev-server-core';
import { TestRunnerCoreConfig } from '@web/test-runner-core';
import { TEST_FRAMEWORK_PATH } from './serveTestFrameworkPlugin';

function createTestPage(testFrameworkImport: string) {
  return `<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <script type="module">
      import "${testFrameworkImport}";
    </script>
  </body>
</html>`;
}

export function serveTestRunnerHtmlPlugin(config: TestRunnerCoreConfig) {
  return {
    name: 'wtr-test-runner-html',

    serve(context: Context) {
      if (context.path === '/') {
        return {
          type: 'html',
          body: config.testRunnerHtml
            ? config.testRunnerHtml(TEST_FRAMEWORK_PATH, config)
            : createTestPage(TEST_FRAMEWORK_PATH),
        };
      }
    },
  };
}
