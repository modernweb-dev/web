const justUrlObject = new URL(new URL('assets/one-PkYUFgN1.svg', import.meta.url).href, import.meta.url);
const href = new URL(new URL('assets/two-mXcSFMIh.svg', import.meta.url).href, import.meta.url).href;
const pathname = new URL(new URL('assets/three-LRYckR_0.svg', import.meta.url).href, import.meta.url).pathname;
const searchParams = new URL(new URL('assets/four-rNTiHfqi.svg', import.meta.url).href, import.meta.url).searchParams;
const someJpg = new URL('./image.jpg', import.meta.url);

console.log({
  justUrlObject,
  href,
  pathname,
  searchParams,
  someJpg,
});
