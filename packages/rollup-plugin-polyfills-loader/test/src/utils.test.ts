import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileTypes } from '@web/polyfills-loader';
import { shouldInjectLoader } from '../../src/utils.ts';

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
