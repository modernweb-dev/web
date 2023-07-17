import { expect } from 'chai';
import { fileTypes } from '@web/polyfills-loader';
import { shouldInjectLoader } from '../../src/utils.js';

describe('shouldInjectLoader', () => {
  it('returns true when modern contains non-module or script', () => {
    expect(
      shouldInjectLoader({
        modern: { files: [{ type: fileTypes.SYSTEMJS, path: '' }] },
      }),
    ).to.equal(true);
  });

  it('returns true when there are legacy files', () => {
    expect(
      shouldInjectLoader({
        modern: { files: [{ type: fileTypes.MODULE, path: '' }] },
        legacy: [{ test: '', files: [{ type: fileTypes.SYSTEMJS, path: '' }] }],
      }),
    ).to.equal(true);
  });

  it('returns true when there are polyfills', () => {
    expect(
      shouldInjectLoader({
        modern: { files: [{ type: fileTypes.MODULE, path: '' }] },
        polyfills: {
          fetch: true,
        },
      }),
    ).to.equal(true);

    expect(
      shouldInjectLoader({
        modern: { files: [{ type: fileTypes.MODULE, path: '' }] },
        polyfills: {
          regeneratorRuntime: 'always',
        },
      }),
    ).to.equal(true);
  });

  it('returns true when there are custom polyfills', () => {
    expect(
      shouldInjectLoader({
        modern: { files: [{ type: fileTypes.MODULE, path: '' }] },
        polyfills: {
          custom: [{ test: '', path: '', name: '' }],
        },
      }),
    ).to.equal(true);
  });
});
