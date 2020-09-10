import { imageOne, nameOne } from './one/one.js';
import { imageTwo, nameTwo } from './one/two/two.js';
import { imageThree, nameThree } from './one/two/three/three.js';
import { imageFour, nameFour } from './one/two/three/four/four.js';

console.log({
  [nameOne]: imageOne,
  [nameTwo]: imageTwo,
  [nameThree]: imageThree,
  [nameFour]: imageFour,
});
