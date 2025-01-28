const justUrlObject = new URL(new URL('assets/one-Bkie7h0E.svg', import.meta.url).href, import.meta.url);
const href = new URL(new URL('assets/two-D7JyS-th.svg', import.meta.url).href, import.meta.url).href;
const pathname = new URL(new URL('assets/three-IN2CmsMK.svg', import.meta.url).href, import.meta.url).pathname;
const searchParams = new URL(new URL('assets/four-CUlW6cvD.svg', import.meta.url).href, import.meta.url).searchParams;

const directories = [
  new URL('./', import.meta.url),
  new URL('./one', import.meta.url),
  new URL('./one/', import.meta.url),
  new URL('./one/two', import.meta.url),
  new URL('./one/two/', import.meta.url),
];

console.log({
  justUrlObject,
  href,
  pathname,
  searchParams,
  directories,
});
