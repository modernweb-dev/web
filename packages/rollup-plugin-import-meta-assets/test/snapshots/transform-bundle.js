const justUrlObject = new URL(new URL('assets/one--RhQWA3U.svg', import.meta.url).href, import.meta.url);
const href = new URL(new URL('assets/two-CZdxIUwi.svg', import.meta.url).href, import.meta.url).href;
const pathname = new URL(new URL('assets/three-tFhyRH_R.svg', import.meta.url).href, import.meta.url).pathname;
const searchParams = new URL(new URL('assets/four-Cs1OId-q.svg', import.meta.url).href, import.meta.url).searchParams;
const someJpg = new URL(new URL('assets/image-C92N8yPj.jpg', import.meta.url).href, import.meta.url);

console.log({
  justUrlObject,
  href,
  pathname,
  searchParams,
  someJpg,
});
