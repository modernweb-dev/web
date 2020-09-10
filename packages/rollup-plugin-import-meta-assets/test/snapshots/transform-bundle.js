const justUrlObject = new URL(new URL('assets/one-d81655b9.svg', import.meta.url).href, import.meta.url);
const href = new URL(new URL('assets/two-00516e7a.svg', import.meta.url).href, import.meta.url).href;
const pathname = new URL(new URL('assets/three-0ba6692d.svg', import.meta.url).href, import.meta.url).pathname;
const searchParams = new URL(new URL('assets/four-a00e2e1d.svg', import.meta.url).href, import.meta.url).searchParams;
const someJpg = new URL(new URL('assets/image-d6eb190c.jpg', import.meta.url).href, import.meta.url);

console.log({
  justUrlObject,
  href,
  pathname,
  searchParams,
  someJpg,
});
