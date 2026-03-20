// Workaround for @jridgewell/remapping .d.cts syntax incompatible with TS 5.9+
// The `export = function` syntax in .d.cts files causes TS1005 parse errors.
// See: https://github.com/jridgewell/remapping/issues/XXX
const fs = require('fs');
const path = require('path');

const file = path.join(
  __dirname,
  '..',
  'node_modules',
  '@jridgewell',
  'remapping',
  'types',
  'remapping.d.cts',
);
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('export =       function')) {
    content = content.replace('export =       function', 'export default function');
    fs.writeFileSync(file, content);
  }
}
