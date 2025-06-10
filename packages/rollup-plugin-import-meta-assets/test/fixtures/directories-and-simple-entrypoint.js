const justUrlObject = new URL('./one.svg', import.meta.url);
const href = new URL('./two.svg', import.meta.url).href;
const pathname = new URL('./three.svg', import.meta.url).pathname;
const searchParams = new URL('./four.svg', import.meta.url).searchParams;

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
