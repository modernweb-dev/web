import { executeServerCommand } from '../../browser/commands.mjs';
import { expect } from '../chai.js';

it('a known command does not throw', async () => {
  await executeServerCommand('command-a');
});

it('a command can return an object', async () => {
  const result = await executeServerCommand('command-a');
  expect(result).to.eql({ foo: 'bar' });
});

it('a command can pass along parameters', async () => {
  const resultA = await executeServerCommand('command-b', { message: 'hello world' });
  expect(resultA).to.be.true;

  const resultB = await executeServerCommand('command-b', { message: 'not hello world' });
  expect(resultB).to.be.false;
});

it('an unmatched command falls through to the next plugin', async () => {
  const result = await executeServerCommand('command-c');
  expect(result).to.be.true;
});

it('a server error causes the command to fail', async () => {
  let thrown = false;
  try {
    await executeServerCommand('command-d', { foo: 'bar' });
  } catch (error) {
    expect(error.message).to.equal(
      'Error while executing command command-d with payload {"foo":"bar"}: error expected to be thrown from command',
    );
    thrown = true;
  }
  expect(thrown).to.be.true;
});

it('an unknown command causes the command to fail', async () => {
  let thrown = false;
  try {
    await executeServerCommand('command-x');
  } catch (error) {
    expect(error.message).to.equal(
      'Error while executing command command-x: Unknown command command-x. Did you install a plugin to handle this command?',
    );
    thrown = true;
  }
  expect(thrown).to.be.true;
});
