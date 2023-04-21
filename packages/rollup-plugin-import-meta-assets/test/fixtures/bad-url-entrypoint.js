const badImage1 = new URL('/absolute-path.svg', import.meta.url).href;
const badImage2 = new URL('../../missing-relative-path.svg', import.meta.url).href;
console.log(badImage1, badImage2);
