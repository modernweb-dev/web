/* eslint-disable */
import { foo } from './module-b.js';

console.log('module a');
console.log(foo());
window.__moduleALoaded = true;
