const justUrlObject = new URL(new URL('assets/one-Bkie7h0E.svg', import.meta.url).href);
const href = new URL(new URL('assets/two-D7JyS-th.svg', import.meta.url).href).href;
const pathname = new URL(new URL('assets/three-IN2CmsMK.svg', import.meta.url).href).pathname;
const searchParams = new URL(new URL('assets/four-CUlW6cvD.svg', import.meta.url).href).searchParams;

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
