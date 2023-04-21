const nameOne = 'one-name';
const imageOne = new URL(new URL('assets/one-824f522a.svg', import.meta.url).href, import.meta.url).href;

const nameTwo = 'two-name';
const imageTwo = new URL(new URL('assets/two-efaa9ab3.svg', import.meta.url).href, import.meta.url).href;

const nameThree = 'three-name';
const imageThree = new URL(new URL('assets/three-63bfb103.svg', import.meta.url).href, import.meta.url).href;

const nameFour = 'four-name';
const imageFour = new URL(new URL('assets/four-360cc920.svg', import.meta.url).href, import.meta.url).href;

console.log({
  [nameOne]: imageOne,
  [nameTwo]: imageTwo,
  [nameThree]: imageThree,
  [nameFour]: imageFour,
});
