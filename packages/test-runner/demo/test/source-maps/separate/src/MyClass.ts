export class MyClass {
  async doFoo(foo: string, bar: number): Promise<string> {
    await Promise.resolve();
    (foo as any).nonExisting();
    return new Promise(resolve => {
      resolve();
    });
  }
}

export function doBar(bar: string, foo: number) {
  throw new Error('undefined is a function');
}
