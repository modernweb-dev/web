function __variableDynamicURLRuntime0__(path) {
  switch (path) {
    case './dynamic-assets/one.svg': return new URL(new URL('assets/one-Bkie7h0E.svg', import.meta.url).href);
    case './dynamic-assets/three.svg': return new URL(new URL('assets/three-IN2CmsMK.svg', import.meta.url).href);
    case './dynamic-assets/two.svg': return new URL(new URL('assets/two-D7JyS-th.svg', import.meta.url).href);
    default: return new Promise(function(resolve, reject) {
      (typeof queueMicrotask === 'function' ? queueMicrotask : setTimeout)(
        reject.bind(null, new Error("Unknown variable dynamic new URL statement: " + path))
      );
    })
   }
 }

const names = ['one', 'two'];
// value of one could also be "two" or "three", bundler does not analyze the value itself
// Therefore, we expect both one.svg, two.svg and three.svg to be bundled, and this to turn into a switch statement
// with 3 cases (for all 3 assets in the dynamic-assets folder)
const dynamicImgs = names.map(n => __variableDynamicURLRuntime0__(`./dynamic-assets/${n}.svg`));
const backticksImg = new URL(new URL('assets/three-IN2CmsMK.svg', import.meta.url).href);

console.log(dynamicImgs, backticksImg);
