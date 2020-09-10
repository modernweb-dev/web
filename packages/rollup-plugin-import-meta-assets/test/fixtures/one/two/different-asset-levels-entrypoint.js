const nameOne = 'one-name';
const imageOne = new URL('../one-deep.svg', import.meta.url).href;

const nameTwo = 'two-name';
const imageTwo = new URL('./two-deep.svg', import.meta.url).href;

const nameThree = 'three-name';
const imageThree = new URL('./three/three-deep.svg', import.meta.url).href;

const nameFour = 'four-name';
const imageFour = new URL('./three/four/four-deep.svg', import.meta.url).href;

console.log({
  [nameOne]: imageOne,
  [nameTwo]: imageTwo,
  [nameThree]: imageThree,
  [nameFour]: imageFour,
});
