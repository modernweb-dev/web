const justUrlObject = new URL(new URL('assets/one-d81655b9.svg', import.meta.url).href);
const href = new URL(new URL('assets/two-00516e7a.svg', import.meta.url).href).href;
const pathname = new URL(new URL('assets/three-0ba6692d.svg', import.meta.url).href).pathname;
const searchParams = new URL(new URL('assets/four-a00e2e1d.svg', import.meta.url).href).searchParams;
const someJpg = new URL('./image.jpg', import.meta.url);

console.log({
  justUrlObject,
  href,
  pathname,
  searchParams,
  someJpg,
});
