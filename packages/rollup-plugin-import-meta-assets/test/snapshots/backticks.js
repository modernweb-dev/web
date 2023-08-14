const backticksImg = new URL(new URL('assets/one-824f522a.svg', import.meta.url).href, import.meta.url);
const backticksImg2 = new URL(new URL('assets/two-efaa9ab3.svg', import.meta.url).href, import.meta.url);

const three = 'three';
const backticksImg3 = new URL(`./${three}.svg`, import.meta.url);

console.log(backticksImg, backticksImg2, backticksImg3);
