<<<<<<< HEAD
import { expect } from 'chai';
import { browsers } from '@mdn/browser-compat-data';
<<<<<<< HEAD
import { isLatestModernBrowser, getLatestStableMajor } from '../src/browser-targets.js';
||||||| parent of c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { isLatestModernBrowser, getLatestStableMajor } from '../src/browser-targets.ts';
=======
import { isLatestModernBrowser, getLatestStableMajor } from '../src/browser-targets.ts';
||||||| parent of 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { expect } from 'chai';
import { browsers } from '@mdn/browser-compat-data';
import { isLatestModernBrowser, getLatestStableMajor } from '../src/browser-targets.js';
=======
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import browserCompatData from '@mdn/browser-compat-data';
const { browsers } = browserCompatData;
import { isLatestModernBrowser, getLatestStableMajor } from '../src/browser-targets.ts';
>>>>>>> 61bf92a0 (chore: migrate tests from mocha/chai to node:test + node:assert)
>>>>>>> c37bb778 (chore: migrate tests from mocha/chai to node:test + node:assert)

describe('isLatestModernBrowser', () => {
  it('returns true for latest Chrome', async () => {
    const latest = getLatestStableMajor(browsers.chrome.releases)!;
    assert.strictEqual(isLatestModernBrowser({ name: 'Chrome', version: String(latest) }), true);
  });

  it('returns true for latest Chrome -1', async () => {
    const latest = getLatestStableMajor(browsers.chrome.releases)!;
    assert.strictEqual(isLatestModernBrowser({ name: 'Chrome', version: String(latest - 1) }), true);
  });

  it('returns true for future version of Chrome', async () => {
    const latest = getLatestStableMajor(browsers.chrome.releases)!;
    assert.strictEqual(isLatestModernBrowser({ name: 'Chrome', version: String(latest + 1) }), true);
  });

  it('returns true for unknown version of Chrome', async () => {
    assert.strictEqual(isLatestModernBrowser({ name: 'Chrome', version: '9999999' }), true);
  });

  it('returns false for latest Chrome -2', async () => {
    const latest = getLatestStableMajor(browsers.chrome.releases)!;
    assert.strictEqual(isLatestModernBrowser({ name: 'Chrome', version: String(latest - 2) }), false);
  });

  it('returns false for latest Chrome -3', async () => {
    const latest = getLatestStableMajor(browsers.chrome.releases)!;
    assert.strictEqual(isLatestModernBrowser({ name: 'Chrome', version: String(latest - 3) }), false);
  });

  it('returns true for latest Chrome Headless', async () => {
    const latest = getLatestStableMajor(browsers.chrome.releases)!;
    assert.strictEqual(isLatestModernBrowser({ name: 'Chrome Headless', version: String(latest) }), true);
  });

  it('returns true for latest chromium', async () => {
    const latest = getLatestStableMajor(browsers.chrome.releases)!;
    assert.strictEqual(isLatestModernBrowser({ name: 'Chromium', version: String(latest) }), true);
  });

  it('returns true for latest Firefox', async () => {
    const latest = getLatestStableMajor(browsers.firefox.releases)!;
    assert.strictEqual(isLatestModernBrowser({ name: 'Firefox', version: String(latest) }), true);
  });

  it('returns false for latest Firefox -1', async () => {
    const latest = getLatestStableMajor(browsers.firefox.releases)!;
    assert.strictEqual(isLatestModernBrowser({ name: 'Firefox', version: String(latest - 1) }), false);
  });

  it('returns false for latest Firefox -2', async () => {
    const latest = getLatestStableMajor(browsers.firefox.releases)!;
    assert.strictEqual(isLatestModernBrowser({ name: 'Firefox', version: String(latest - 2) }), false);
  });

  it('returns true for latest Edge', async () => {
    const latest = getLatestStableMajor(browsers.edge.releases)!;
    assert.strictEqual(isLatestModernBrowser({ name: 'Edge', version: String(latest) }), true);
  });

  it('returns true for latest Edge -1', async () => {
    const latest = getLatestStableMajor(browsers.edge.releases)!;
    assert.strictEqual(isLatestModernBrowser({ name: 'Edge', version: String(latest - 1) }), true);
  });

  it('returns false for latest Edge -2', async () => {
    const latest = getLatestStableMajor(browsers.edge.releases)!;
    assert.strictEqual(isLatestModernBrowser({ name: 'Chrome', version: String(latest - 2) }), false);
  });
});
