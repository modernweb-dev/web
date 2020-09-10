import { imageOne, nameOne } from '../../../one.js';
import { imageTwo, nameTwo } from '../../two.js';
import { imageThree, nameThree } from '../three.js';
import { imageFour, nameFour } from './four.js';

console.log({
  [nameOne]: imageOne,
  [nameTwo]: imageTwo,
  [nameThree]: imageThree,
  [nameFour]: imageFour,
});
