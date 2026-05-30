const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { readConfig } = require('../src/index');

const configName = 'my-project.config';
const packageCjsPath = path.resolve(__dirname, 'fixtures', 'package-cjs');
const packageMjsPath = path.resolve(__dirname, 'fixtures', 'package-mjs');

describe('cjs package', () => {
  it('can load commonjs-in-.cjs', async () => {
    const result = await readConfig(
      configName,
      undefined,
      path.resolve(packageCjsPath, 'commonjs-in-.cjs'),
    );
    assert.deepEqual(result, { foo: 'bar' });
  });

  it('can load commonjs-in-.js', async () => {
    const result = await readConfig(
      configName,
      undefined,
      path.resolve(packageCjsPath, 'commonjs-in-.js'),
    );
    assert.deepEqual(result, { foo: 'bar' });
  });

  it('can load module-in-.mjs', async () => {
    const result = await readConfig(
      configName,
      undefined,
      path.resolve(packageCjsPath, 'module-in-.mjs'),
    );
    assert.deepEqual(result, { foo: 'bar' });
  });

  it('throws when loading module-in-.cjs', async () => {
    await assert.rejects(
      () => readConfig(configName, undefined, path.resolve(packageCjsPath, 'module-in-.cjs')),
      error => {
        assert.ok(
          error.message.includes(
            'You are using es module syntax in a config loaded as CommonJS module.',
          ),
        );
        return true;
      },
    );
  });

  it('throws when loading module-in-.js', async () => {
    await assert.rejects(
      () => readConfig(configName, undefined, path.resolve(packageCjsPath, 'module-in-.js')),
      error => {
        assert.ok(
          error.message.includes(
            'You are using es module syntax in a config loaded as CommonJS module.',
          ),
        );
        return true;
      },
    );
  });

  it('throws when loading commonjs-in-.mjs', async () => {
    await assert.rejects(
      () => readConfig(configName, undefined, path.resolve(packageCjsPath, 'commonjs-in-.mjs')),
      error => {
        assert.ok(
          error.message.includes(
            'You are using CommonJS syntax such as "require" or "module.exports" in a config loaded as es module.',
          ),
        );
        return true;
      },
    );
  });
});

describe('mjs package', () => {
  it('can load commonjs-in-.cjs', async () => {
    const result = await readConfig(
      configName,
      undefined,
      path.resolve(packageMjsPath, 'commonjs-in-.cjs'),
    );
    assert.deepEqual(result, { foo: 'bar' });
  });

  it('throws when loading commonjs-in-.js', async () => {
    await assert.rejects(
      () => readConfig(configName, undefined, path.resolve(packageMjsPath, 'commonjs-in-.js')),
      error => {
        assert.ok(
          error.message.includes(
            'You are using CommonJS syntax such as "require" or "module.exports" in a config loaded as es module.',
          ),
        );
        return true;
      },
    );
  });

  it('throws when loading commonjs-in-.mjs', async () => {
    await assert.rejects(
      () => readConfig(configName, undefined, path.resolve(packageMjsPath, 'commonjs-in-.mjs')),
      error => {
        assert.ok(
          error.message.includes(
            'You are using CommonJS syntax such as "require" or "module.exports" in a config loaded as es module.',
          ),
        );
        return true;
      },
    );
  });

  it('throws when loading module-in-.cjs', async () => {
    await assert.rejects(
      () => readConfig(configName, undefined, path.resolve(packageCjsPath, 'module-in-.cjs')),
      error => {
        assert.ok(
          error.message.includes(
            'You are using es module syntax in a config loaded as CommonJS module.',
          ),
        );
        return true;
      },
    );
  });

  it('can load module-in-.js', async () => {
    const result = await readConfig(
      configName,
      undefined,
      path.resolve(packageMjsPath, 'module-in-.js'),
    );
    assert.deepEqual(result, { foo: 'bar' });
  });

  it('can load module-in-.mjs', async () => {
    const result = await readConfig(
      configName,
      undefined,
      path.resolve(packageMjsPath, 'module-in-.mjs'),
    );
    assert.deepEqual(result, { foo: 'bar' });
  });
});
