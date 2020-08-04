import { Context } from '@web/dev-server-core';
import { TestRunnerCoreConfig } from '@web/test-runner-core';

function createTestPage(testFrameworkImport: string) {
  return `<!DOCTYPE html>
<html>
  <head></head>
  <body>
    <script type="module">
      import('${testFrameworkImport}').catch((error) => {
        console.error(error);
        console.error('\x1B[31mThe test framework could not be loaded. Are your dependencies installed correctly? Is there a server plugin or middleware that interferes?\x1B[39m');
      });
    </script>
  </body>
</html>`;
}

export function serveTestRunnerHtmlPlugin(
  config: TestRunnerCoreConfig,
  testFrameworkImport?: string,
) {
  return {
    name: 'wtr-test-runner-html',

    serve(context: Context) {
      if (!testFrameworkImport) {
        throw new Error('Cannot test javascript files without a testFramework configured.');
      }

      if (context.path === '/') {
        return {
          type: 'html',
          body: config.testRunnerHtml
            ? config.testRunnerHtml(testFrameworkImport, config)
            : createTestPage(testFrameworkImport),
        };
      }
    },
  };
}
