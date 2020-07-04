import { expect } from 'chai';
import { browsers } from 'mdn-browser-compat-data';
import {
  isRecentModernBrowserForBrowser,
  getLatestStableRelease,
} from '../src/isRecentModernBrowser';

describe('isRecentModernBrowserForBrowser', () => {
  it('returns true for latest Chrome', async () => {
    const latest = getLatestStableRelease(browsers.chrome.releases);
    expect(isRecentModernBrowserForBrowser('Chrome', latest!)).to.be.true;
  });

  it('returns true for latest Chrome -1', async () => {
    const latest = getLatestStableRelease(browsers.chrome.releases);
    expect(isRecentModernBrowserForBrowser('chrome', Number(latest!) - 1)).to.be.true;
  });

  it('returns true for future version of Chrome', async () => {
    const latest = getLatestStableRelease(browsers.chrome.releases);
    expect(isRecentModernBrowserForBrowser('Chrome', Number(latest!) + 1)).to.be.true;
  });

  it('returns true for unknown version of Chrome', async () => {
    expect(isRecentModernBrowserForBrowser('Chrome', 9999999)).to.be.true;
  });

  it('returns false for latest Chrome -2', async () => {
    const latest = getLatestStableRelease(browsers.chrome.releases);
    expect(isRecentModernBrowserForBrowser('chrome', Number(latest!) - 2)).to.be.false;
  });

  it('returns false for latest Chrome -3', async () => {
    const latest = getLatestStableRelease(browsers.chrome.releases);
    expect(isRecentModernBrowserForBrowser('chrome', Number(latest!) - 3)).to.be.false;
  });

  it('returns true for latest Chrome Headless', async () => {
    const latest = getLatestStableRelease(browsers.chrome.releases);
    expect(isRecentModernBrowserForBrowser('Chrome Headless', latest!)).to.be.true;
  });

  it('returns true for latest chromium', async () => {
    const latest = getLatestStableRelease(browsers.chrome.releases);
    expect(isRecentModernBrowserForBrowser('Chromium', latest!)).to.be.true;
  });

  it('returns true for latest Firefox', async () => {
    const latest = getLatestStableRelease(browsers.firefox.releases);
    expect(isRecentModernBrowserForBrowser('Firefox', latest!)).to.be.true;
  });

  it('returns false for latest Firefox -1', async () => {
    const latest = getLatestStableRelease(browsers.firefox.releases);
    expect(isRecentModernBrowserForBrowser('chrome', Number(latest!) - 1)).to.be.false;
  });

  it('returns false for latest Firefox -2', async () => {
    const latest = getLatestStableRelease(browsers.firefox.releases);
    expect(isRecentModernBrowserForBrowser('chrome', Number(latest!) - 2)).to.be.false;
  });

  it('returns true for latest Edge', async () => {
    const latest = getLatestStableRelease(browsers.edge.releases);
    expect(isRecentModernBrowserForBrowser('Edge', latest!)).to.be.true;
  });

  it('returns true for latest Edge -1', async () => {
    const latest = getLatestStableRelease(browsers.edge.releases);
    expect(isRecentModernBrowserForBrowser('chrome', Number(latest!) - 1)).to.be.true;
  });

  it('returns false for latest Edge -2', async () => {
    const latest = getLatestStableRelease(browsers.edge.releases);
    expect(isRecentModernBrowserForBrowser('chrome', Number(latest!) - 2)).to.be.false;
  });
});
