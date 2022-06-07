const nameOne = 'one-name';
const imageOne = new URL(new URL('assets/one-134aaf72.svg', import.meta.url).href).href;

const nameTwo = 'two-name';
const imageTwo = new URL(new URL('assets/two-e4de930c.svg', import.meta.url).href).href;

const nameThree = 'three-name';
const imageThree = new URL(new URL('assets/three-3f2c16b3.svg', import.meta.url).href).href;

const nameFour = 'four-name';
const imageFour = new URL(new URL('assets/four-b40404a7.svg', import.meta.url).href).href;

console.log({
  [nameOne]: imageOne,
  [nameTwo]: imageTwo,
  [nameThree]: imageThree,
  [nameFour]: imageFour,
});
