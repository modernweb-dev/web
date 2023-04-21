import { TestRunnerPlugin } from '@web/test-runner-core';
import type { ChromeLauncher, puppeteerCore } from '@web/test-runner-chrome';
import type { PlaywrightLauncher } from '@web/test-runner-playwright';
import type { WebdriverLauncher } from '@web/test-runner-webdriver';

type TypePayload = { type: string };
type PressPayload = { press: string };
type DownPayload = { down: string };
type UpPayload = { up: string };

export type SendKeysPayload = TypePayload | PressPayload | DownPayload | UpPayload;

function isObject(payload: unknown): payload is Record<string, unknown> {
  return payload != null && typeof payload === 'object';
}

function isSendKeysPayload(payload: unknown): boolean {
  const validOptions = ['type', 'press', 'down', 'up'];

  if (!isObject(payload)) throw new Error('You must provide a `SendKeysPayload` object');

  const numberOfValidOptions = Object.keys(payload).filter(key =>
    validOptions.includes(key),
  ).length;
  const unknownOptions = Object.keys(payload).filter(key => !validOptions.includes(key));

  if (numberOfValidOptions > 1)
    throw new Error(
      `You must provide ONLY one of the following properties to pass to the browser runner: ${validOptions.join(
        ', ',
      )}.`,
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

function isTypePayload(payload: SendKeysPayload): payload is TypePayload {
  return 'type' in payload;
}

function isPressPayload(payload: SendKeysPayload): payload is PressPayload {
  return 'press' in payload;
}

function isDownPayload(payload: SendKeysPayload): payload is DownPayload {
  return 'down' in payload;
}

function isUpPayload(payload: SendKeysPayload): payload is UpPayload {
  return 'up' in payload;
}

export function sendKeysPlugin(): TestRunnerPlugin<SendKeysPayload> {
  return {
    name: 'send-keys-command',
    async executeCommand({ command, payload, session }): Promise<any> {
      if (command === 'send-keys') {
        if (!isSendKeysPayload(payload) || !payload) {
          throw new Error('You must provide a `SendKeysPayload` object');
        }
        // handle specific behavior for playwright
        if (session.browser.type === 'playwright') {
          const page = (session.browser as PlaywrightLauncher).getPage(session.id);
          if (isTypePayload(payload)) {
            await page.keyboard.type(payload.type);
            return true;
          } else if (isPressPayload(payload)) {
            await page.keyboard.press(payload.press);
            return true;
          } else if (isDownPayload(payload)) {
            await page.keyboard.down(payload.down);
            return true;
          } else if (isUpPayload(payload)) {
            await page.keyboard.up(payload.up);
            return true;
          }
        }

        // handle specific behavior for puppeteer
        if (session.browser.type === 'puppeteer') {
          const page = (session.browser as ChromeLauncher).getPage(session.id);
          if (isTypePayload(payload)) {
            await page.keyboard.type(payload.type);
            return true;
          } else if (isPressPayload(payload)) {
            await page.keyboard.press(payload.press as puppeteerCore.KeyInput);
            return true;
          } else if (isDownPayload(payload)) {
            await page.keyboard.down(payload.down as puppeteerCore.KeyInput);
            return true;
          } else if (isUpPayload(payload)) {
            await page.keyboard.up(payload.up as puppeteerCore.KeyInput);
            return true;
          }
        }

        // handle specific behavior for webdriver
        if (session.browser.type === 'webdriver') {
          const browser = session.browser as WebdriverLauncher;
          if (isTypePayload(payload)) {
            await browser.sendKeys(session.id, payload.type.split(''));
            return true;
          } else if (isPressPayload(payload)) {
            await browser.sendKeys(session.id, [payload.press]);
            return true;
          } else {
            throw new Error('Only "press" and "type" are supported by webdriver.');
          }
        }

        // you might not be able to support all browser launchers
        throw new Error(`Sending keys is not supported for browser type ${session.browser.type}.`);
      }
    },
  };
}
