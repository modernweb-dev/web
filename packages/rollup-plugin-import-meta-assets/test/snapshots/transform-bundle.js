const justUrlObject = new URL(new URL('assets/one--RhQWA3U.svg', import.meta.url).href);
const href = new URL(new URL('assets/two-CZdxIUwi.svg', import.meta.url).href).href;
const pathname = new URL(new URL('assets/three-tFhyRH_R.svg', import.meta.url).href).pathname;
const searchParams = new URL(new URL('assets/four-Cs1OId-q.svg', import.meta.url).href).searchParams;
const someJpg = new URL(new URL('assets/image-C92N8yPj.jpg', import.meta.url).href);

console.log({
  justUrlObject,
  href,
  pathname,
  searchParams,
  someJpg,
});
