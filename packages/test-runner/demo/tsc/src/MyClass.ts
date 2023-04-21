export class MyClass {
  async doFoo(foo: string, bar: number): Promise<void> {
    await Promise.resolve();
    (foo as any).nonExisting();
    return new Promise<void>(resolve => {
      resolve();
    });
  }
}

export function doBar(bar: string, foo: number) {
  throw new Error('undefined is a function');
}
