const path = require('path');
const { expect } = require('chai');
const semver = require('semver');
const { readConfig } = require('../src/index');

// some tests are specific for node < v12.17.0
const supportsEsm = semver.satisfies(process.version, '>=12.17.0');
const configName = 'my-project.config';
const packageCjsPath = path.resolve(__dirname, 'fixtures', 'package-cjs');
const packageMjsPath = path.resolve(__dirname, 'fixtures', 'package-mjs');

async function expectThrowsOldNodeError(configPath) {
  let thrown = false;
  try {
    await readConfig(configName, undefined, configPath);
  } catch (error) {
    thrown = true;
    expect(error.message).to.include(
      'You are trying to load a config as es module but your version of node does not support it',
    );
  }
  expect(thrown).to.equal(true);
}

describe('cjs package', () => {
  it('can load commonjs-in-.cjs', async () => {
    const result = await readConfig(
      configName,
      undefined,
      path.resolve(packageCjsPath, 'commonjs-in-.cjs'),
    );
    expect(result).to.eql({ foo: 'bar' });
  });

  it('can load commonjs-in-.js', async () => {
    const result = await readConfig(
      configName,
      undefined,
      path.resolve(packageCjsPath, 'commonjs-in-.js'),
    );
    expect(result).to.eql({ foo: 'bar' });
  });

  if (supportsEsm) {
    it('can load module-in-.mjs', async () => {
      const result = await readConfig(
        configName,
        undefined,
        path.resolve(packageCjsPath, 'module-in-.mjs'),
      );
      expect(result).to.eql({ foo: 'bar' });
    });
  } else {
    it('throws an error when trying to load a mjs file', async () => {
      await expectThrowsOldNodeError(path.resolve(packageCjsPath, 'module-in-.mjs'));
    });
  }

  it('throws when loading module-in-.cjs @slow', async () => {
    let thrown = false;
    try {
      await readConfig(configName, undefined, path.resolve(packageCjsPath, 'module-in-.cjs'));
    } catch (error) {
      thrown = true;
      expect(error.message).to.include(
        'You are using es module syntax in a config loaded as CommonJS module.',
      );
    }
    expect(thrown).to.equal(true);
  });

  it('throws when loading module-in-.js', async () => {
    let thrown = false;
    try {
      await readConfig(configName, undefined, path.resolve(packageCjsPath, 'module-in-.js'));
    } catch (error) {
      thrown = true;
      expect(error.message).to.include(
        'You are using es module syntax in a config loaded as CommonJS module.',
      );
    }
    expect(thrown).to.equal(true);
  });

  if (supportsEsm) {
    it('throws when loading commonjs-in-.mjs', async () => {
      let thrown = false;
      try {
        await readConfig(configName, undefined, path.resolve(packageCjsPath, 'commonjs-in-.mjs'));
      } catch (error) {
        thrown = true;
        expect(error.message).to.include(
          'You are using CommonJS syntax such as "require" or "module.exports" in a config loaded as es module.',
        );
      }
      expect(thrown).to.equal(true);
    });
  }
});

describe('mjs package', () => {
  it('can load commonjs-in-.cjs', async () => {
    const result = await readConfig(
      configName,
      undefined,
      path.resolve(packageMjsPath, 'commonjs-in-.cjs'),
    );
    expect(result).to.eql({ foo: 'bar' });
  });

  if (supportsEsm) {
    it('throws when loading commonjs-in-.js', async () => {
      let thrown = false;
      try {
        await readConfig(configName, undefined, path.resolve(packageMjsPath, 'commonjs-in-.js'));
      } catch (error) {
        thrown = true;
        expect(error.message).to.include(
          'You are using CommonJS syntax such as "require" or "module.exports" in a config loaded as es module.',
        );
      }
      expect(thrown).to.equal(true);
    });
  } else {
    it('throws an error when trying to load commonjs-in-.js', async () => {
      await expectThrowsOldNodeError(path.resolve(packageMjsPath, 'commonjs-in-.js'));
    });
  }

  if (supportsEsm) {
    it('throws when loading commonjs-in-.mjs', async () => {
      let thrown = false;
      try {
        await readConfig(configName, undefined, path.resolve(packageMjsPath, 'commonjs-in-.mjs'));
      } catch (error) {
        thrown = true;
        expect(error.message).to.include(
          'You are using CommonJS syntax such as "require" or "module.exports" in a config loaded as es module.',
        );
      }
      expect(thrown).to.equal(true);
    });
  } else {
    it('throws an error when trying to load commonjs-in-.mjs', async () => {
      await expectThrowsOldNodeError(path.resolve(packageMjsPath, 'commonjs-in-.mjs'));
    });
  }

  it('throws when loading module-in-.cjs', async () => {
    let thrown = false;
    try {
      await readConfig(configName, undefined, path.resolve(packageCjsPath, 'module-in-.cjs'));
    } catch (error) {
      thrown = true;
      expect(error.message).to.include(
        'You are using es module syntax in a config loaded as CommonJS module.',
      );
    }
    expect(thrown).to.equal(true);
  });

  if (supportsEsm) {
    it('can load module-in-.js @slow', async () => {
      const result = await readConfig(
        configName,
        undefined,
        path.resolve(packageMjsPath, 'module-in-.js'),
      );
      expect(result).to.eql({ foo: 'bar' });
    });
  } else {
    it('throws an error when trying to load module-in-.js', async () => {
      await expectThrowsOldNodeError(path.resolve(packageMjsPath, 'module-in-.js'));
    });
  }

  if (supportsEsm) {
    it('can load module-in-.mjs', async () => {
      const result = await readConfig(
        configName,
        undefined,
        path.resolve(packageMjsPath, 'module-in-.mjs'),
      );
      expect(result).to.eql({ foo: 'bar' });
    });
  } else {
    it('throws an error when trying to load a mjs file', async () => {
      await expectThrowsOldNodeError(path.resolve(packageMjsPath, 'module-in-.mjs'));
    });
  }
});
