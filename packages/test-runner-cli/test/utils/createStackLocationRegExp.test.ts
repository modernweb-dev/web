import { createStackLocationRegExp } from '../../src/utils/createStackLocationRegExp';
import { expect } from 'chai';

const regexp = createStackLocationRegExp('http:', 'localhost', 1234);

it('works for chrome stack traces', () => {
  const string = 'at throwError (demo/test/shared-a.js:89:20)';
  const result = string.match(regexp);
  if (!Array.isArray(result)) throw new Error('No match found');

  const [, prefix, browserPath, line, column, suffix] = result;
  expect(prefix).to.equal(' (');
  expect(browserPath).to.equal('demo/test/shared-a.js');
  expect(line).to.equal('89');
  expect(column).to.equal('20');
  expect(suffix).to.equal(')');
});

it('works for chrome stack traces from native errors', () => {
  const string = 'at http://localhost:1234/demo/test/shared-a.js:89:20';
  const result = string.match(regexp);
  if (!Array.isArray(result)) throw new Error('No match found');

  const [, prefix, browserPath, line, column, suffix] = result;
  expect(prefix).to.equal(' ');
  expect(browserPath).to.equal('demo/test/shared-a.js');
  expect(line).to.equal('89');
  expect(column).to.equal('20');
  expect(suffix).to.equal('');
});

it('works for firefox and webkit stack traces', () => {
  const string = 'throwError@http://localhost:1234/packages/test-runner/demo/test/shared-a.js:8:9';
  const result = string.match(regexp);
  if (!Array.isArray(result)) throw new Error('No match found');

  const [, prefix, browserPath, line, column, suffix] = result;
  expect(prefix).to.equal('@');
  expect(browserPath).to.equal('packages/test-runner/demo/test/shared-a.js');
  expect(line).to.equal('8');
  expect(column).to.equal('9');
  expect(suffix).to.equal('');
});

it('works for firefox and webkit stack traces without server', () => {
  const string = 'throwError@packages/test-runner/demo/test/shared-a.js:8:9';
  const result = string.match(regexp);
  if (!Array.isArray(result)) throw new Error('No match found');

  const [, prefix, browserPath, line, column, suffix] = result;
  expect(prefix).to.equal('@');
  expect(browserPath).to.equal('packages/test-runner/demo/test/shared-a.js');
  expect(line).to.equal('8');
  expect(column).to.equal('9');
  expect(suffix).to.equal('');
});

it('works for stack traces that start with a /', () => {
  const string = 'at throwError (/demo/test/shared-a.js:89:20)';
  const result = string.match(regexp);
  if (!Array.isArray(result)) throw new Error('No match found');

  const [, prefix, browserPath, line, column, suffix] = result;
  expect(prefix).to.equal(' (');
  expect(browserPath).to.equal('/demo/test/shared-a.js');
  expect(line).to.equal('89');
  expect(column).to.equal('20');
  expect(suffix).to.equal(')');
});

it('strips url parameters from the stack trace', () => {
  const string = 'at throwError (/demo/test/shared-a.js?foo=bar:89:20)';
  const result = string.match(regexp);
  if (!Array.isArray(result)) throw new Error('No match found');

  const [, prefix, browserPath, line, column, suffix] = result;
  expect(prefix).to.equal(' (');
  expect(browserPath).to.equal('/demo/test/shared-a.js');
  expect(line).to.equal('89');
  expect(column).to.equal('20');
  expect(suffix).to.equal(')');
});

it('strips url hashes from the stack trace', () => {
  const string = 'at throwError (/demo/test/shared-a.js#bar:89:20)';
  const result = string.match(regexp);
  if (!Array.isArray(result)) throw new Error('No match found');

  const [, prefix, browserPath, line, column, suffix] = result;
  expect(prefix).to.equal(' (');
  expect(browserPath).to.equal('/demo/test/shared-a.js');
  expect(line).to.equal('89');
  expect(column).to.equal('20');
  expect(suffix).to.equal(')');
});

it('strips url params and hashes from the stack trace', () => {
  const string = 'at throwError (/demo/test/shared-a.js?foo=bar#xyz:89:20)';
  const result = string.match(regexp);
  if (!Array.isArray(result)) throw new Error('No match found');

  const [, prefix, browserPath, line, column, suffix] = result;
  expect(prefix).to.equal(' (');
  expect(browserPath).to.equal('/demo/test/shared-a.js');
  expect(line).to.equal('89');
  expect(column).to.equal('20');
  expect(suffix).to.equal(')');
});

it('works for node unix stack traces', () => {
  const string =
    'at ChromeLauncher.stopSession (/Users/me/code/web/packages/test-runner-chrome/dist/ChromeLauncher.js:108:25)';
  const result = string.match(regexp);
  if (!Array.isArray(result)) throw new Error('No match found');

  const [, prefix, browserPath, line, column, suffix] = result;
  expect(prefix).to.equal(' (');
  expect(browserPath).to.equal(
    '/Users/me/code/web/packages/test-runner-chrome/dist/ChromeLauncher.js',
  );
  expect(line).to.equal('108');
  expect(column).to.equal('25');
  expect(suffix).to.equal(')');
});

it('works for node windows stack traces', () => {
  const string =
    'at ChromeLauncher.stopSession (C:\\code\\web\\packages\\test-runner-chrome\\dist\\ChromeLauncher.js:108:25)';
  const result = string.match(regexp);
  if (!Array.isArray(result)) throw new Error('No match found');

  const [, prefix, browserPath, line, column, suffix] = result;
  expect(prefix).to.equal(' (');
  expect(browserPath).to.equal(
    'C:\\code\\web\\packages\\test-runner-chrome\\dist\\ChromeLauncher.js',
  );
  expect(line).to.equal('108');
  expect(column).to.equal('25');
  expect(suffix).to.equal(')');
});
