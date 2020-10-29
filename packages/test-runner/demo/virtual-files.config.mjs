export default /** @type {import('@web/test-runner').TestRunnerConfig} */ ({
  files: 'demo/test/virtual-files/*.test.js',

  plugins: [
    {
      serve(context) {
        // no source map
        if (context.path === '/demo/test/virtual-files/a.js') {
          return `
            export function a(condition) {
              if (condition) {
                return 'a';
              }
              return 'b';
            }
          `;
        }

        // with source map
        if (context.path === '/demo/test/virtual-files/b.js') {
          return `
            export function b(condition) {
              if (condition) {
                  return 'a';
              }
              return 'b';
            }
            //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxVQUFVLENBQUMsQ0FBQyxTQUFrQjtJQUNsQyxJQUFJLFNBQVMsRUFBRTtRQUNiLE9BQU8sR0FBRyxDQUFDO0tBQ1o7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gYihjb25kaXRpb246IHVua25vd24pIHtcbiAgaWYgKGNvbmRpdGlvbikge1xuICAgIHJldHVybiAnYSc7XG4gIH1cbiAgcmV0dXJuICdiJztcbn0iXX0=
        `;
        }
      },
    },
  ],
});
