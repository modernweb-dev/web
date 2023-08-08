const backticksImg = new URL(`./one.svg`, import.meta.url);
const backticksImg2 = new URL(`./two.svg`, import.meta.url);

const three = 'three';
const backticksImg3 = new URL(`./${three}.svg`, import.meta.url);

console.log(backticksImg, backticksImg2, backticksImg3);
