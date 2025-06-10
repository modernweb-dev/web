const nameOne = 'one-name';
const imageOne = new URL(new URL('assets/one-deep-Bkie7h0E.svg', import.meta.url).href).href;

const nameTwo = 'two-name';
const imageTwo = new URL(new URL('assets/two-deep-D7JyS-th.svg', import.meta.url).href).href;

const nameThree = 'three-name';
const imageThree = new URL(new URL('assets/three-deep-IN2CmsMK.svg', import.meta.url).href).href;

const nameFour = 'four-name';
const imageFour = new URL(new URL('assets/four-deep-CUlW6cvD.svg', import.meta.url).href).href;

console.log({
  [nameOne]: imageOne,
  [nameTwo]: imageTwo,
  [nameThree]: imageThree,
  [nameFour]: imageFour,
});
