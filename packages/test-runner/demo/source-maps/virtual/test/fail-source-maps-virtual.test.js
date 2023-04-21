import { MyClass, doBar } from '../src/MyClass.js';

describe('fail source maps separate', () => {
  it('fails one', () => {
    doBar('a', 5);
  });

  it('fails two', async () => {
    const myClass = new MyClass();
    await myClass.doFoo('a', 5);
  });
});
