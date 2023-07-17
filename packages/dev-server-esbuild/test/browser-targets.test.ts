import { expect } from 'chai';
import { browsers } from '@mdn/browser-compat-data';
import { isLatestModernBrowser, getLatestStableMajor } from '../src/browser-targets.js';

describe('isLatestModernBrowser', () => {
  it('returns true for latest Chrome', async () => {
    const latest = getLatestStableMajor(browsers.chrome.releases)!;
    expect(isLatestModernBrowser({ name: 'Chrome', version: String(latest) })).to.be.true;
  });

  it('returns true for latest Chrome -1', async () => {
    const latest = getLatestStableMajor(browsers.chrome.releases)!;
    expect(isLatestModernBrowser({ name: 'Chrome', version: String(latest - 1) })).to.be.true;
  });

  it('returns true for future version of Chrome', async () => {
    const latest = getLatestStableMajor(browsers.chrome.releases)!;
    expect(isLatestModernBrowser({ name: 'Chrome', version: String(latest + 1) })).to.be.true;
  });

  it('returns true for unknown version of Chrome', async () => {
    expect(isLatestModernBrowser({ name: 'Chrome', version: '9999999' })).to.be.true;
  });

  it('returns false for latest Chrome -2', async () => {
    const latest = getLatestStableMajor(browsers.chrome.releases)!;
    expect(isLatestModernBrowser({ name: 'Chrome', version: String(latest - 2) })).to.be.false;
  });

  it('returns false for latest Chrome -3', async () => {
    const latest = getLatestStableMajor(browsers.chrome.releases)!;
    expect(isLatestModernBrowser({ name: 'Chrome', version: String(latest - 3) })).to.be.false;
  });

  it('returns true for latest Chrome Headless', async () => {
    const latest = getLatestStableMajor(browsers.chrome.releases)!;
    expect(isLatestModernBrowser({ name: 'Chrome Headless', version: String(latest) })).to.be.true;
  });

  it('returns true for latest chromium', async () => {
    const latest = getLatestStableMajor(browsers.chrome.releases)!;
    expect(isLatestModernBrowser({ name: 'Chromium', version: String(latest) })).to.be.true;
  });

  it('returns true for latest Firefox', async () => {
    const latest = getLatestStableMajor(browsers.firefox.releases)!;
    expect(isLatestModernBrowser({ name: 'Firefox', version: String(latest) })).to.be.true;
  });

  it('returns false for latest Firefox -1', async () => {
    const latest = getLatestStableMajor(browsers.firefox.releases)!;
    expect(isLatestModernBrowser({ name: 'Firefox', version: String(latest - 1) })).to.be.false;
  });

  it('returns false for latest Firefox -2', async () => {
    const latest = getLatestStableMajor(browsers.firefox.releases)!;
    expect(isLatestModernBrowser({ name: 'Firefox', version: String(latest - 2) })).to.be.false;
  });

  it('returns true for latest Edge', async () => {
    const latest = getLatestStableMajor(browsers.edge.releases)!;
    expect(isLatestModernBrowser({ name: 'Edge', version: String(latest) })).to.be.true;
  });

  it('returns true for latest Edge -1', async () => {
    const latest = getLatestStableMajor(browsers.edge.releases)!;
    expect(isLatestModernBrowser({ name: 'Edge', version: String(latest - 1) })).to.be.true;
  });

  it('returns false for latest Edge -2', async () => {
    const latest = getLatestStableMajor(browsers.edge.releases)!;
    expect(isLatestModernBrowser({ name: 'Chrome', version: String(latest - 2) })).to.be.false;
  });
});
