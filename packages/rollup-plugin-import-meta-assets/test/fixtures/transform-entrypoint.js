const justUrlObject = new URL('./one.svg', import.meta.url);
const href = new URL('./two.svg', import.meta.url).href;
const pathname = new URL('./three.svg', import.meta.url).pathname;
const searchParams = new URL('./four.svg', import.meta.url).searchParams;
const someJpg = new URL('./image.jpg', import.meta.url);

console.log({
  justUrlObject,
  href,
  pathname,
  searchParams,
  someJpg,
});
