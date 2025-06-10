const justUrlObject = new URL(new URL('assets/one-Bkie7h0E.svg', import.meta.url).href);
const href = new URL(new URL('assets/two-D7JyS-th.svg', import.meta.url).href).href;
const pathname = new URL(new URL('assets/three-IN2CmsMK.svg', import.meta.url).href).pathname;
const searchParams = new URL(new URL('assets/four-CUlW6cvD.svg', import.meta.url).href).searchParams;
const noExtension = new URL(new URL('assets/five-Bnvj_R70', import.meta.url).href);

console.log({
  justUrlObject,
  href,
  pathname,
  searchParams,
  noExtension,
});
