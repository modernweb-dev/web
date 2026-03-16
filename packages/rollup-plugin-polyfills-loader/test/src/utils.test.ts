import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
<<<<<<< HEAD
import { fileTypes } from '@web/polyfills-loader.js';
import { shouldInjectLoader } from '../../src/utils.ts';
||||||| parent of 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)
import { fileTypes } from '@web/polyfills-loader.ts';
import { shouldInjectLoader } from '../../src/utils.ts';
=======
import { fileTypes } from '@web/polyfills-loader';
import { shouldInjectLoader } from '../../src/utils.js';
>>>>>>> 9007e014 (chore: migrate tests from mocha/chai to node:test + node:assert)

describe('shouldInjectLoader', () => {
  it('returns true when modern contains non-module or script', () => {
    assert.equal(
      shouldInjectLoader({
        modern: { files: [{ type: fileTypes.SYSTEMJS, path: '' }] },
      }),
      true,
    );
  });

  it('returns true when there are legacy files', () => {
    assert.equal(
      shouldInjectLoader({
        modern: { files: [{ type: fileTypes.MODULE, path: '' }] },
        legacy: [{ test: '', files: [{ type: fileTypes.SYSTEMJS, path: '' }] }],
      }),
      true,
    );
  });

  it('returns true when there are polyfills', () => {
    assert.equal(
      shouldInjectLoader({
        modern: { files: [{ type: fileTypes.MODULE, path: '' }] },
        polyfills: {
          fetch: true,
        },
      }),
      true,
    );

    assert.equal(
      shouldInjectLoader({
        modern: { files: [{ type: fileTypes.MODULE, path: '' }] },
        polyfills: {
          regeneratorRuntime: 'always',
        },
      }),
      true,
    );
  });

  it('returns true when there are custom polyfills', () => {
    assert.equal(
      shouldInjectLoader({
        modern: { files: [{ type: fileTypes.MODULE, path: '' }] },
        polyfills: {
          custom: [{ test: '', path: '', name: '' }],
        },
      }),
      true,
    );
  });
});
