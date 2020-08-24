// test disabled until https://github.com/evanw/esbuild/issues/344 is solved
// import { expect } from 'chai';
// import fetch from 'node-fetch';
// import { expectIncludes, createTestServer } from '@web/dev-server-core/test-helpers';

// import { esbuildPlugin } from '../src/esbuildPlugin';

// describe('esbuildPlugin JSON', function () {
//   it('transforms .json files', async () => {
//     const { server, host } = await createTestServer({
//       rootDir: __dirname,
//       plugins: [
//         {
//           name: 'test',
//           serve(context) {
//             if (context.path === '/foo.json') {
//               return '{ "foo": "bar" }';
//             }
//           },
//         },
//         esbuildPlugin({ json: true }),
//       ],
//     });

//     try {
//       const response = await fetch(`${host}/foo.json`);
//       const text = await response.text();

//       expect(response.status).to.equal(200);
//       expect(response.headers.get('content-type')).to.equal(
//         'application/javascript; charset=utf-8',
//       );
//     } finally {
//       server.stop();
//     }
//   });
// });
