import { TestRunnerPlugin } from '@web/test-runner-core';
import type { ChromeLauncher, puppeteerCore } from '@web/test-runner-chrome';
import type { PlaywrightLauncher } from '@web/test-runner-playwright';

export type SendKeysPayload =
  | { type: string; press?: undefined }
  | { type?: undefined; press: string };

function isObject(payload: unknown): payload is Record<string, unknown> {
  return payload != null && typeof payload === 'object';
}

function isSendKeysPayload(payload: unknown): boolean {
  if (!isObject(payload)) throw new Error('You must provide a `SendKeysPayload` object');
  if (!!payload.type && !!payload.press)
    throw new Error(
      'You must provide ONLY one of the `type` or `press` properties for pass to the browser runner.',
    );
  if (!payload.type && !payload.press)
    throw new Error(
      'You mist provide one of the `type` or `press` properties for pass to the browser runner.',
    );
  const payloadKeys = Object.keys(payload).filter(key => key !== 'press' && key !== 'type');
  if (payloadKeys.length) {
    throw new Error('Unknown options `' + payloadKeys.join(', ') + '` present.');
  }
  return true;
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
          if (payload.type) {
            await page.keyboard.type(payload.type);
            return true;
          } else if (payload.press) {
            await page.keyboard.press(payload.press);
            return true;
          }
        }

        // handle specific behavior for puppeteer
        if (session.browser.type === 'puppeteer') {
          const page = (session.browser as ChromeLauncher).getPage(session.id);
          if (payload.type) {
            await page.keyboard.type(payload.type);
            return true;
          } else if (payload.press) {
            await page.keyboard.press(payload.press as puppeteerCore.KeyInput);
            return true;
          }
        }

        // you might not be able to support all browser launchers
        throw new Error(`Sending keys is not supported for browser type ${session.browser.type}.`);
      }
    },
  };
}
