const justUrlObject = new URL(new URL('assets/one-134aaf72.svg', import.meta.url).href, import.meta.url);
const href = new URL(new URL('assets/two-e4de930c.svg', import.meta.url).href, import.meta.url).href;
const pathname = new URL(new URL('assets/three-3f2c16b3.svg', import.meta.url).href, import.meta.url).pathname;
const searchParams = new URL(new URL('assets/four-b40404a7.svg', import.meta.url).href, import.meta.url).searchParams;

console.log({
  justUrlObject,
  href,
  pathname,
  searchParams,
});
