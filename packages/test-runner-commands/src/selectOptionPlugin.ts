import { TestRunnerPlugin } from '@web/test-runner-core';
import type { ChromeLauncher } from '@web/test-runner-chrome';
import type { PlaywrightLauncher } from '@web/test-runner-playwright';

type SelectByValuePayload = { selector: string; value: string };
type SelectByLabelPayload = { selector: string; label: string };
type SelectMultipleValuesPayload = { selector: string; values: string[] };

export type SelectOptionPayload =
  | SelectByLabelPayload
  | SelectByValuePayload
  | SelectMultipleValuesPayload;

function isObject(payload: unknown): payload is Record<string, unknown> {
  return payload != null && typeof payload === 'object';
}

function isSelectOptionPayload(payload: unknown): boolean {
  const validOptions = ['value', 'label', 'values'];

  if (!isObject(payload)) throw new Error('You must provide a `SelectOptionPayload` object');

  if (!payload.selector || typeof payload.selector !== 'string') {
    throw new Error(`You must provide a selector representing the select you wish to locate`);
  }

  const numberOfValidOptions = Object.keys(payload).filter(key =>
    validOptions.includes(key),
  ).length;
  const unknownOptions = Object.keys(payload).filter(
    key => ![...validOptions, 'selector'].includes(key),
  );

  if (numberOfValidOptions === 0)
    throw new Error(
      `You must provide one of the following properties to pass to the browser runner: ${validOptions.join(
        ', ',
      )}.`,
    );
  if (unknownOptions.length > 0) {
    throw new Error('Unknown options `' + unknownOptions.join(', ') + '` present.');
  }
  return true;
}

function isValuePayload(payload: SelectOptionPayload): payload is SelectByValuePayload {
  return 'selector' in payload && 'value' in payload;
}

function isLabelPayload(payload: SelectOptionPayload): payload is SelectByLabelPayload {
  return 'selector' in payload && 'label' in payload;
}

function isMultiplePayload(payload: SelectOptionPayload): payload is SelectMultipleValuesPayload {
  return 'selector' in payload && 'values' in payload;
}

export function selectOptionPlugin(): TestRunnerPlugin<SelectOptionPayload> {
  return {
    name: 'select-option-command',
    async executeCommand({ command, payload, session }): Promise<any> {
      if (command === 'select-option') {
        if (!isSelectOptionPayload(payload) || !payload) {
          throw new Error('You must provide a `SelectOptionPayload` object');
        }
        // handle specific behavior for playwright
        if (session.browser.type === 'playwright') {
          const page = (session.browser as PlaywrightLauncher).getPage(session.id);
          if (isValuePayload(payload)) {
            const { selector, value } = payload;
            await page.locator(selector).selectOption(value);
            return true;
          } else if (isLabelPayload(payload)) {
            const { selector, label } = payload;
            await page.locator(selector).selectOption({ label });
            return true;
          } else if (isMultiplePayload(payload)) {
            const { selector, values } = payload;
            await page.locator(selector).selectOption([...values]);
            return true;
          }
        }

        // handle specific behavior for puppeteer
        if (session.browser.type === 'puppeteer') {
          const page = (session.browser as ChromeLauncher).getPage(session.id);
          if (isValuePayload(payload)) {
            const { selector, value } = payload;
            await page.select(selector, value);
            return true;
          } else if (isMultiplePayload(payload)) {
            const { selector, values } = payload;
            await page.select(selector, ...values);
            return true;
          } else {
            throw new Error(`Puppeteer only supports selection of an option by its value(s):
            https://pptr.dev/next/api/puppeteer.page.select#parameters
            `);
          }
        }

        // handle specific behavior for webdriver
        if (session.browser.type === 'webdriver') {
          throw new Error(`Selecting an option via a browser driver command is not currently implemented in WebDriver yet.
            https://www.selenium.dev/documentation/webdriver/elements/select_lists/
            
            When using WebDriver, the current recommended (September 2022) approach is to:
            - locate your select element (via querySelector or querySelectorAll)
            - focus the element
            - use sendKeys() to type the label of the option you wish to select
            - use select.dispatchEvent(new Event('change')) to trigger a change event on the select.
            `);
        }

        // you might not be able to support all browser launchers
        throw new Error(
          `Selection of select element options is not supported for browser type ${session.browser.type}.`,
        );
      }
    },
  };
}
