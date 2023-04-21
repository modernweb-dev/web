import { TestRunnerPlugin } from '@web/test-runner-core';
import type { ChromeLauncher } from '@web/test-runner-chrome';
import type { PlaywrightLauncher } from '@web/test-runner-playwright';
import type { WebdriverLauncher } from '@web/test-runner-webdriver';

type MousePosition = [number, number];
type MouseButton = 'left' | 'middle' | 'right';

export type SendMousePayload = MovePayload | ClickPayload | DownPayload | UpPayload;

export type MovePayload = {
  type: 'move';
  position: MousePosition;
};

export type ClickPayload = {
  type: 'click';
  position: MousePosition;
  button?: MouseButton;
};

export type DownPayload = {
  type: 'down';
  button?: MouseButton;
};

export type UpPayload = {
  type: 'up';
  button?: MouseButton;
};

function isObject(payload: unknown): payload is Record<string, unknown> {
  return payload != null && typeof payload === 'object';
}

function isSendMousePayload(payload: unknown): payload is SendMousePayload {
  const validTypes = ['move', 'click', 'down', 'up'];
  const validButtons = ['left', 'middle', 'right'];

  if (!isObject(payload)) {
    throw new Error('You must provide a `SendMousePayload` object');
  }

  if (typeof payload.type !== 'string' || !validTypes.includes(payload.type)) {
    throw new Error(
      `You must provide a type option with one of the following values: ${validTypes.join(', ')}.`,
    );
  }

  if (['click', 'move'].includes(payload.type)) {
    if (
      !Array.isArray(payload.position) ||
      typeof payload.position[0] !== 'number' ||
      typeof payload.position[1] !== 'number' ||
      !Number.isInteger(payload.position[0]) ||
      !Number.isInteger(payload.position[1])
    ) {
      throw new Error(
        'You must provide a position option as a [x, y] tuple where x and y are integers.',
      );
    }
  }

  if (['click', 'up', 'down'].includes(payload.type)) {
    if (typeof payload.button === 'string' && !validButtons.includes(payload.button)) {
      throw new Error(
        `The button option must be one of the following values when provided: ${validButtons.join(
          ', ',
        )}.`,
      );
    }
  }

  return true;
}

export function sendMousePlugin(): TestRunnerPlugin<SendMousePayload> {
  return {
    name: 'send-mouse-command',
    async executeCommand({ command, payload, session }): Promise<any> {
      if (command === 'send-mouse') {
        if (!payload || !isSendMousePayload(payload)) {
          throw new Error('You must provide a `SendMousePayload` object');
        }

        // handle specific behavior for playwright
        if (session.browser.type === 'playwright') {
          const page = (session.browser as PlaywrightLauncher).getPage(session.id);
          switch (payload.type) {
            case 'move':
              await page.mouse.move(payload.position[0], payload.position[1]);
              return true;
            case 'click':
              await page.mouse.click(payload.position[0], payload.position[1], {
                button: payload.button,
              });
              return true;
            case 'down':
              await page.mouse.down({ button: payload.button });
              return true;
            case 'up':
              await page.mouse.up({ button: payload.button });
              return true;
          }
        }

        // handle specific behavior for puppeteer
        if (session.browser.type === 'puppeteer') {
          const page = (session.browser as ChromeLauncher).getPage(session.id);
          switch (payload.type) {
            case 'move':
              await page.mouse.move(payload.position[0], payload.position[1]);
              return true;
            case 'click':
              await page.mouse.click(payload.position[0], payload.position[1], {
                button: payload.button,
              });
              return true;
            case 'down':
              await page.mouse.down({ button: payload.button });
              return true;
            case 'up':
              await page.mouse.up({ button: payload.button });
              return true;
          }
        }

        // handle specific behavior for webdriver
        if (session.browser.type === 'webdriver') {
          const page = session.browser as WebdriverLauncher;
          switch (payload.type) {
            case 'move':
              await page.sendMouseMove(session.id, payload.position[0], payload.position[1]);
              return true;
            case 'click':
              await page.sendMouseClick(
                session.id,
                payload.position[0],
                payload.position[1],
                payload.button,
              );
              return true;
            case 'down':
              await page.sendMouseDown(session.id, payload.button);
              return true;
            case 'up':
              await page.sendMouseUp(session.id, payload.button);
              return true;
          }
        }

        // you might not be able to support all browser launchers
        throw new Error(`Sending mouse is not supported for browser type ${session.browser.type}.`);
      }

      if (command === 'reset-mouse') {
        // handle specific behavior for playwright
        if (session.browser.type === 'playwright') {
          const page = (session.browser as PlaywrightLauncher).getPage(session.id);
          await page.mouse.up({ button: 'left' });
          await page.mouse.up({ button: 'middle' });
          await page.mouse.up({ button: 'right' });
          await page.mouse.move(0, 0);
          return true;
        }

        // handle specific behavior for puppeteer
        if (session.browser.type === 'puppeteer') {
          const page = (session.browser as ChromeLauncher).getPage(session.id);
          await page.mouse.up({ button: 'left' });
          await page.mouse.up({ button: 'middle' });
          await page.mouse.up({ button: 'right' });
          await page.mouse.move(0, 0);
          return true;
        }

        // handle specific behavior for webdriver
        if (session.browser.type === 'webdriver') {
          const page = session.browser as WebdriverLauncher;
          await page.resetMouse(session.id);
          return true;
        }

        // you might not be able to support all browser launchers
        throw new Error(
          `Resetting mouse is not supported for browser type ${session.browser.type}.`,
        );
      }
    },
  };
}
