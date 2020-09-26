import { Context } from '@web/dev-server-core';

import { PARAM_SESSION_ID, PARAM_TEST_FILE } from '../../utils/constants';
import { TestRunnerCoreConfig } from '../../config/TestRunnerCoreConfig';
import { createTestFileImportPath } from '../utils';
import { trackBrowserLogs } from './trackBrowserLogs';

function createTestPage(browserLogs: boolean, testFrameworkImport: string) {
  return `<!DOCTYPE html>
<html>
  <head>${browserLogs ? trackBrowserLogs : ''}</head>
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

async function getManualListItem(config: TestRunnerCoreConfig, context: Context, testFile: string) {
  const testImportPath = await createTestFileImportPath(config, context, testFile);
  return `<li><a href="/?${PARAM_TEST_FILE}=${testImportPath}">${testImportPath}</a></li>`;
}

async function createManualDebugPage(
  config: TestRunnerCoreConfig,
  context: Context,
  testFiles: string[],
) {
  const listItems = await Promise.all(
    testFiles.map(file => getManualListItem(config, context, file)).join('\n'),
  );

  return `<!DOCTYPE html>
<html>
  <head>
    <style>
      p {
        max-width: 600px;
      }
    </style>
  </head>

  <body>
    <h1>Web Test Runner</h1>
    <p>Select a file to debug manually in a custom browser not controlled by Web Test Runner.</p>
    
    <p>
      Advanced functionalities such commands for changing viewport and screenshots don't work here. 
      Use the regular debug option to debug in a controlled browser.
    </p>

    <h2>Test files</h2>
    <ul>
      ${listItems.join('\n')}
    </ul>
  </body>
</html>
`;
}

export function serveTestRunnerHtmlPlugin(
  config: TestRunnerCoreConfig,
  testFiles: string[],
  testFrameworkImport?: string,
) {
  return {
    name: 'wtr-test-runner-html',

    serve(context: Context) {
      if (!testFrameworkImport) {
        throw new Error('Cannot test javascript files without a testFramework configured.');
      }

      if (context.path === '/') {
        const { searchParams } = context.URL;
        if (searchParams.has(PARAM_SESSION_ID) || searchParams.has(PARAM_TEST_FILE)) {
          return {
            type: 'html',
            body: config.testRunnerHtml
              ? config.testRunnerHtml(testFrameworkImport, config)
              : createTestPage(!!config.browserLogs, testFrameworkImport),
          };
        } else if (searchParams.has('experimental-iframe-mode')) {
          return '<html><head></head><body></body></html>';
        } else {
          return {
            type: 'html',
            body: createManualDebugPage(config, context, testFiles),
          };
        }
      }
    },
  };
}
