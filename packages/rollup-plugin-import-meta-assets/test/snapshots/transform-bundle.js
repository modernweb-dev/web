const justUrlObject = new URL(new URL('assets/one-2d604b7f.svg', import.meta.url).href, import.meta.url);
const href = new URL(new URL('assets/two-4f4a5196.svg', import.meta.url).href, import.meta.url).href;
const pathname = new URL(new URL('assets/three-cb83a3f2.svg', import.meta.url).href, import.meta.url).pathname;
const searchParams = new URL(new URL('assets/four-97848687.svg', import.meta.url).href, import.meta.url).searchParams;
const someJpg = new URL(new URL('assets/image-c160fa1b.jpg', import.meta.url).href, import.meta.url);

console.log({
  justUrlObject,
  href,
  pathname,
  searchParams,
  someJpg,
});
