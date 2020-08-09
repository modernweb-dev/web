import { TestRunnerPlugin } from '@web/test-runner-core';
import type { ChromeLauncher } from '@web/test-runner-chrome';
import type { PlaywrightLauncher } from '@web/test-runner-playwright';

export interface Media {
  media?: 'screen' | 'print';
  colorScheme?: 'dark' | 'light' | 'no-preference';
  reducedMotion?: 'reduce' | 'no-preference';
}

function isObject(payload: unknown): payload is Record<string, unknown> {
  return payload != null && typeof payload === 'object';
}

function isMediaObject(payload: unknown): payload is Media {
  if (!isObject(payload)) throw new Error('You must provide a viewport object');

  if (payload.media != null && !(typeof payload.media === 'string')) {
    throw new Error('media should be a string.');
  }

  if (payload.colorScheme != null && !(typeof payload.colorScheme === 'string')) {
    throw new Error('colorScheme should be a string.');
  }

  if (payload.reducedMotion != null && !(typeof payload.reducedMotion === 'string')) {
    throw new Error('reducedMotion should be a string.');
  }
  return true;
}

export function emulateMediaPlugin(): TestRunnerPlugin {
  return {
    name: 'emulate-media-command',

    async executeCommand({ command, payload, session }) {
      if (command === 'emulate-media') {
        if (!isMediaObject(payload)) {
          throw new Error('You must provide a viewport object');
        }

        if (session.browser.type === 'puppeteer') {
          const page = (session.browser as ChromeLauncher).getPage(session.id);
          const features = [];

          if (payload.colorScheme != null) {
            features.push({ name: 'prefers-color-scheme', value: payload.colorScheme });
          }
          if (payload.reducedMotion != null) {
            features.push({ name: 'prefers-reduced-motion', value: payload.reducedMotion });
          }

          await page.emulateMediaFeatures(features);

          if (payload.media) {
            await page.emulateMediaType(payload.media);
          }

          return true;
        }

        if (session.browser.type === 'playwright') {
          const page = (session.browser as PlaywrightLauncher).getPage(session.id);
          await page.emulateMedia(payload as any);
          return true;
        }

        throw new Error(
          `Setting viewport is not supported for browser type ${session.browser.type}.`,
        );
      }
    },
  };
}
