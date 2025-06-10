import { TestRunnerPlugin } from '@web/test-runner-core';
import type { ChromeLauncher } from '@web/test-runner-chrome';
import type { PlaywrightLauncher } from '@web/test-runner-playwright';
import type { WebdriverLauncher } from '@web/test-runner-webdriver';

import { defaultOptions, VisualRegressionPluginOptions } from './config.js';
import {
  visualDiffCommand,
  VisualDiffCommandContext,
  VisualDiffCommandResult,
} from './visualDiffCommand.js';
import { VisualRegressionError } from './VisualRegressionError.js';

interface Payload {
  id: string;
  name: string;
}

function validatePayload(payload: any): payload is Payload {
  if (payload == null || typeof payload !== 'object') {
    throw new Error('Command visual-diff requires a payload with an id and name');
  }

  if (typeof payload.id !== 'string') {
    throw new Error('Command visual-diff is missing an id in payload');
  }

  if (typeof payload.name !== 'string') {
    throw new Error('Command visual-diff is missing a name in payload');
  }
  return true;
}

export function visualRegressionPlugin(
  options: Partial<VisualRegressionPluginOptions> = {},
): TestRunnerPlugin {
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    diffOptions: {
      ...defaultOptions.diffOptions,
      ...options.diffOptions,
    },
  };

  return {
    name: 'visual-regression',

    async executeCommand({ command, session, payload }): Promise<VisualDiffCommandResult | void> {
      if (command === 'visual-diff') {
        try {
          if (!validatePayload(payload)) {
            return;
          }

          const context: VisualDiffCommandContext = {
            testFile: session.testFile,
            browser: session.browser.name,
          };

          if (session.browser.type === 'puppeteer') {
            const browser = session.browser as ChromeLauncher;
            const page = browser.getPage(session.id);

            const handle = await page.evaluateHandle(function findElement(elementId) {
              return (
                (window as any).__WTR_VISUAL_REGRESSION__ &&
                (window as any).__WTR_VISUAL_REGRESSION__[elementId]
              );
            }, payload.id);
            // @ts-ignore
            const element = handle.asElement();
            if (!element) {
              throw new VisualRegressionError(
                'Something went wrong diffing element, the browser could not find it.',
              );
            }

            const screenshot = await element.screenshot({ encoding: 'binary' });
            return visualDiffCommand(mergedOptions, Buffer.from(screenshot), payload.name, context);
          }

          if (session.browser.type === 'playwright') {
            const browser = session.browser as PlaywrightLauncher;
            const page = browser.getPage(session.id);

            const handle = await page.evaluateHandle(function findElement(elementId) {
              return (
                (window as any).__WTR_VISUAL_REGRESSION__ &&
                (window as any).__WTR_VISUAL_REGRESSION__[elementId]
              );
            }, payload.id);
            const element = handle.asElement();
            if (!element) {
              throw new VisualRegressionError(
                'Something went wrong diffing element, the browser could not find it.',
              );
            }

            const screenshot = await element.screenshot();
            return visualDiffCommand(mergedOptions, screenshot, payload.name, context);
          }

          if (session.browser.type === 'webdriver') {
            const browser = session.browser as WebdriverLauncher;

            const locator = `
              return (function () {
                try {
                  var wtr = window.__WTR_VISUAL_REGRESSION__;
                  return wtr && wtr[${payload.id}];
                } catch (_) {
                  return undefined;
                }
              })();
            `;

            const screenshot = await browser.takeScreenshot(session.id, locator);
            return visualDiffCommand(mergedOptions, screenshot, payload.name, context);
          }

          throw new Error(
            `Browser type ${session.browser.type} is not supported for visual diffing.`,
          );
        } catch (error: unknown) {
          if (error instanceof VisualRegressionError) {
            return {
              errorMessage: `Something went wrong while executing creating visual diff: ${error.message}`,
              diffPercentage: -1,
              passed: false,
            };
          }

          console.error(error);
          return {
            errorMessage: 'Something went wrong while creating visual diff.',
            diffPercentage: -1,
            passed: false,
          };
        }
      }
    },
  };
}
