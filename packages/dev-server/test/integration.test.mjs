import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

import { startDevServer } from '../index.mjs';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const testCases = [
  {
    name: 'base-path',
    tests: ['moduleLoaded'],
  },
  {
    name: 'index-rewrite',
    tests: ['moduleLoaded'],
  },
  {
    name: 'node-resolve',
    tests: [
      'developmentExportCondition',
      'inlineNodeResolve',
      'nodeResolve',
      'noExtension',
      'extensionPriority',
    ],
  },
  {
    name: 'static',
    tests: ['moduleLoaded'],
  },
  {
    name: 'syntax',
    tests: ['stage4', 'inlineStage4', 'importMeta', 'staticImports', 'dynamicImports'],
  },
  {
    name: 'export-conditions',
    tests: ['prodExport'],
  },
];

describe('integration tests', () => {
  let browser;

  before(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
    });
  });

  after(() => {
    browser.close();
  });

  for (const testCase of testCases) {
    describe(`testcase ${testCase.name}`, function test() {
      this.timeout(30000);
      let server;

      beforeEach(async () => {
        server = await startDevServer({
          autoExitProcess: false,
          logStartMessage: false,
          argv: ['--config', path.join(dirname, `../demo/${testCase.name}/config.mjs`)],
        });
      });

      afterEach(async () => {
        await server.stop();
      });

      it('passes the in-browser tests', async function it() {
        const openPath = `/demo/${testCase.name}/`;
        const browserPath = `http://${server.config.hostname}:${server.config.port}${openPath}`;
        const page = await browser.newPage();
        await page.goto(browserPath, {
          waitUntil: 'networkidle2',
        });

        const browserTests = await page.evaluate(() => window.__tests);

        // the demos run "tests", which we check here
        for (const test of testCase.tests) {
          if (!browserTests[test]) {
            throw new Error(`Expected test ${test} to have passed in the browser.`);
          }
        }
      });
    });
  }
});
