const nameOne = 'one-name';
const imageOne = new URL(new URL('assets/one-deep-d40c1b4b.svg', import.meta.url).href).href;

const nameTwo = 'two-name';
const imageTwo = new URL(new URL('assets/two-deep-e73b0d96.svg', import.meta.url).href).href;

const nameThree = 'three-name';
const imageThree = new URL(new URL('assets/three-deep-801763e8.svg', import.meta.url).href).href;

const nameFour = 'four-name';
const imageFour = new URL(new URL('assets/four-deep-c65478aa.svg', import.meta.url).href).href;

console.log({
  [nameOne]: imageOne,
  [nameTwo]: imageTwo,
  [nameThree]: imageThree,
  [nameFour]: imageFour,
});
