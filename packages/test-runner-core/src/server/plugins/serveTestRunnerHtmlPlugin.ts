import { Context, getRequestFilePath } from '@web/dev-server-core';

import { PARAM_SESSION_ID, PARAM_TEST_FILE } from '../../utils/constants.js';
import { TestRunnerCoreConfig } from '../../config/TestRunnerCoreConfig.js';
import { createTestFileImportPath } from '../utils.js';
import { trackBrowserLogs } from './trackBrowserLogs.js';
import { TestSessionManager } from '../../test-session/TestSessionManager.js';
import { TestRunnerGroupConfig } from '../../config/TestRunnerGroupConfig.js';

const iframeModePage = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      iframe {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        border: none;
      }
    </style>
  </head>
  <body></body>
</html>
`;

async function getManualListItem(config: TestRunnerCoreConfig, context: Context, testFile: string) {
  const testImportPath = await createTestFileImportPath(config, context, testFile);
  const displayedPath = testImportPath.split('?')[0].substring(1);
  const pagename = displayedPath.endsWith('.html') ? displayedPath : '/';
  const href = `${pagename}?${PARAM_TEST_FILE}=${encodeURIComponent(testImportPath)}`;
  return `<li><a href="${href}">${displayedPath}</a></li>`;
}

async function createManualDebugPage(
  config: TestRunnerCoreConfig,
  context: Context,
  testFiles: string[],
) {
  const listItems = (
    await Promise.all(testFiles.map(file => getManualListItem(config, context, file)))
  ).join('\n');

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
      ${listItems}
    </ul>
  </body>
</html>
`;
}

function getInjectIndex(html: string) {
  const headIndex = html.indexOf('<head>');
  if (headIndex !== -1) return '<head>'.length + headIndex;

  const bodyIndex = html.indexOf('<body>');
  if (bodyIndex !== -1) return '<body>'.length + bodyIndex;

  return 0;
}

function injectRuntime(
  html: string,
  config: Record<string, unknown>,
  browserLogs: boolean,
  preloadedModule?: string,
) {
  const preloadLink = preloadedModule
    ? `<link rel="preload" as="script" crossorigin="anonymous" href="${preloadedModule}">`
    : '';
  const configScript = `<script type="module">window.__WTR_CONFIG__ = ${JSON.stringify(
    config,
  )}</script>`;
  const injectedHtml = `${preloadLink}${browserLogs ? `${trackBrowserLogs}` : ''}${configScript}`;
  const injectLocation = getInjectIndex(html);

  return `${html.substring(0, injectLocation)}${injectedHtml}${html.substring(injectLocation)}`;
}

function createTestRunnerHtml(
  testFrameworkImport: string,
  config: TestRunnerCoreConfig,
  groupConfig?: TestRunnerGroupConfig,
) {
  let body: string;
  if (groupConfig?.testRunnerHtml) {
    // there is a group in scope, regular test or debug
    body = groupConfig.testRunnerHtml(testFrameworkImport, config, groupConfig);
  } else if (config.testRunnerHtml) {
    // there is no group in scope, ex. when manually debugging
    body = config.testRunnerHtml(testFrameworkImport, config);
  } else {
    // no user defined test runner HTML
    body = `<!DOCTYPE html><html><head></head><body><script type="module" src="${testFrameworkImport}"></script></body></html>`;
  }

  return { body, type: 'html' };
}

export function serveTestRunnerHtmlPlugin(
  config: TestRunnerCoreConfig,
  testFiles: string[],
  sessions: TestSessionManager,
  testFrameworkImport?: string,
) {
  return {
    name: 'wtr-test-runner-html',

    async serve(context: Context) {
      if (!testFrameworkImport) {
        throw new Error('Cannot test javascript files without a testFramework configured.');
      }

      if (context.path === '/') {
        const { searchParams } = context.URL;
        if (searchParams.has(PARAM_TEST_FILE)) {
          return createTestRunnerHtml(testFrameworkImport, config);
        }

        const sessionId = searchParams.get(PARAM_SESSION_ID);
        if (sessionId) {
          const session = sessions.get(sessionId) ?? sessions.getDebug(sessionId);
          if (!session) {
            throw new Error(`Could not find session ${sessionId}`);
          }
          return createTestRunnerHtml(testFrameworkImport, config, session.group);
        }

        if (searchParams.get('mode') === 'iframe') {
          return {
            type: 'html',
            body: iframeModePage,
          };
        }

        return {
          type: 'html',
          body: await createManualDebugPage(config, context, testFiles),
        };
      }
    },

    async transform(context: Context) {
      if (!context.response.is('html')) {
        return;
      }
      const isTestRunnerHtml = context.path === '/';
      if (
        !isTestRunnerHtml &&
        !testFiles.includes(getRequestFilePath(context.url, config.rootDir))
      ) {
        return;
      }

      const { searchParams } = context.URL;
      const sessionId = searchParams.get(PARAM_SESSION_ID);
      if (sessionId) {
        const session = sessions.get(sessionId) ?? sessions.getDebug(sessionId);
        if (!session) {
          throw new Error(`Could not find session ${sessionId}`);
        }

        const testFile = await createTestFileImportPath(
          config,
          context,
          session.testFile,
          sessionId,
        );

        const runtimeConfig = {
          testFile,
          watch: !!config.watch,
          debug: session.debug,
          testFrameworkConfig: config.testFramework?.config,
        };

        context.body = injectRuntime(
          context.body as string,
          runtimeConfig,
          !!config.browserLogs,
          isTestRunnerHtml ? testFile : undefined,
        );
        return;
      }

      const testFile = searchParams.get(PARAM_TEST_FILE);
      if (testFile) {
        const runtimeConfig = {
          testFile,
          watch: !!config.watch,
          debug: true,
          testFrameworkConfig: config.testFramework?.config,
        };

        context.body = injectRuntime(
          context.body as string,
          runtimeConfig,
          !!config.browserLogs,
          isTestRunnerHtml ? testFile : undefined,
        )!;
        return;
      }
    },
  };
}
