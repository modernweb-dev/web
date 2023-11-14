const justUrlObject = new URL(new URL('assets/one-ZInu4dBJ.svg', import.meta.url).href, import.meta.url);
const href = new URL(new URL('assets/two--yckvrYd.svg', import.meta.url).href, import.meta.url).href;
const pathname = new URL(new URL('assets/three-CDdgprDC.svg', import.meta.url).href, import.meta.url).pathname;
const searchParams = new URL(new URL('assets/four-lJVunLww.svg', import.meta.url).href, import.meta.url).searchParams;
const noExtension = new URL(new URL('assets/five-Z74_0e9C', import.meta.url).href, import.meta.url);

console.log({
  justUrlObject,
  href,
  pathname,
  searchParams,
  noExtension,
});
