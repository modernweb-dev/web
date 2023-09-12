const names = ['one', 'two'];
// value of one could also be "two" or "three", bundler does not analyze the value itself
// Therefore, we expect both one.svg, two.svg and three.svg to be bundled, and this to turn into a switch statement
// with 3 cases (for all 3 assets in the dynamic-assets folder)
const dynamicImgs = names.map(n => new URL(`./dynamic-assets/${n}.svg`,import.meta.url));
const backticksImg = new URL(`./dynamic-assets/three.svg`, import.meta.url);

console.log(dynamicImgs, backticksImg);
