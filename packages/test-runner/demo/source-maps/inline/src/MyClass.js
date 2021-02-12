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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXlDbGFzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk15Q2xhc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxPQUFPLE9BQU87SUFDbEIsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFXLEVBQUUsR0FBVztRQUNsQyxNQUFNLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2QixHQUFXLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0IsT0FBTyxJQUFJLE9BQU8sQ0FBTyxPQUFPLENBQUMsRUFBRTtZQUNqQyxPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBRUQsTUFBTSxVQUFVLEtBQUssQ0FBQyxHQUFXLEVBQUUsR0FBVztJQUM1QyxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDN0MsQ0FBQyJ9