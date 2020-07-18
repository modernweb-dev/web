import { MyClass, doBar } from './src/MyClass.js';

describe('fail source maps separate', () => {
  it('fails one', () => {
    doBar();
  });

  it('fails two', async () => {
    const myClass = new MyClass();
    await myClass.doFoo();
  });
});
