import { UAParser } from 'ua-parser-js';

export function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  return {
    name: browser.name,
    version: browser.version != null ? String(browser.version) : undefined,
  };
}
