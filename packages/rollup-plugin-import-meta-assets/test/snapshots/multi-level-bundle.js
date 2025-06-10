const nameOne = 'one-name';
const imageOne = new URL(new URL('assets/one-Bkie7h0E.svg', import.meta.url).href).href;

const nameTwo = 'two-name';
const imageTwo = new URL(new URL('assets/two-D7JyS-th.svg', import.meta.url).href).href;

const nameThree = 'three-name';
const imageThree = new URL(new URL('assets/three-IN2CmsMK.svg', import.meta.url).href).href;

const nameFour = 'four-name';
const imageFour = new URL(new URL('assets/four-CUlW6cvD.svg', import.meta.url).href).href;

console.log({
  [nameOne]: imageOne,
  [nameTwo]: imageTwo,
  [nameThree]: imageThree,
  [nameFour]: imageFour,
});
