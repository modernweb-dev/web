import { MyClass, doBar } from '../src/MyClass';
describe('fail source maps separate', () => {
    it('fails one', () => {
        doBar('a', 5);
    });
    it('fails two', async () => {
        const myClass = new MyClass();
        await myClass.doFoo('a', 5);
    });
});
//# sourceMappingURL=fail-1.test.js.map