export class MyClass {
    async doFoo(foo, bar) {
        await Promise.resolve();
        foo.nonExisting();
        return new Promise(resolve => {
            resolve();
        });
    }
}
export function doBar(bar, foo) {
    throw new Error('undefined is a function');
}
//# sourceMappingURL=MyClass.js.map