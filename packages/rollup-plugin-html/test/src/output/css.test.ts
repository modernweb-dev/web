import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

function expectIncludes(actual: string, expected: string) {
  if (!actual.includes(expected)) {
    throw new Error(
      `Expected substring not found.\n\nExpected:\n${expected}\n\nActual:\n${actual}`,
    );
  }
}
import {
  createAssetPlaceholder,
  replacePlaceholders,
  calculateRelativePath,
} from '../../../dist/output/css.js';

describe('createAssetPlaceholder', () => {
  it('creates a placeholder with the given hash', () => {
    assert.equal(createAssetPlaceholder('abc123'), '__ROLLUP_ASSET_URL_abc123__');
  });
});

describe('replacePlaceholders', () => {
  it('replaces placeholders with resolved paths', () => {
    const css = `.foo { background: url('__ROLLUP_ASSET_URL_abc123__'); }`;
    const resolver = (hash: string) => (hash === 'abc123' ? '../assets/image.png' : undefined);
    const result = replacePlaceholders(css, resolver);
    assert.equal(result, `.foo { background: url('../assets/image.png'); }`);
  });

  it('preserves fragments after placeholder', () => {
    const css = `.foo { background: url('__ROLLUP_ASSET_URL_abc123__#icon'); }`;
    const resolver = () => '../assets/sprite.svg';
    const result = replacePlaceholders(css, resolver);
    assert.equal(result, `.foo { background: url('../assets/sprite.svg#icon'); }`);
  });

  it('preserves query strings after placeholder', () => {
    const css = `.foo { src: url('__ROLLUP_ASSET_URL_abc123__?v=1.0'); }`;
    const resolver = () => '../fonts/font.woff2';
    const result = replacePlaceholders(css, resolver);
    assert.equal(result, `.foo { src: url('../fonts/font.woff2?v=1.0'); }`);
  });

  it('keeps placeholder when resolver returns undefined', () => {
    const css = `.foo { background: url('__ROLLUP_ASSET_URL_unknown__'); }`;
    const resolver = () => undefined;
    const result = replacePlaceholders(css, resolver);
    assert.equal(result, css);
  });

  it('replaces multiple placeholders', () => {
    const css = `
        .a { background: url('__ROLLUP_ASSET_URL_abc1__'); }
        .b { background: url('__ROLLUP_ASSET_URL_def2__'); }
      `;
    const resolver = (hash: string) => {
      if (hash === 'abc1') return 'assets/image1.png';
      if (hash === 'def2') return 'assets/image2.png';
      return undefined;
    };
    const result = replacePlaceholders(css, resolver);
    expectIncludes(result, "url('assets/image1.png')");
    expectIncludes(result, "url('assets/image2.png')");
  });
});

describe('calculateRelativePath', () => {
  it('calculates relative path for same directory', () => {
    assert.equal(calculateRelativePath('styles/main.css', 'styles/image.png'), 'image.png');
  });

  it('calculates relative path for parent directory', () => {
    assert.equal(calculateRelativePath('styles/main.css', 'image.png'), '../image.png');
  });

  it('calculates relative path for sibling directory', () => {
    assert.equal(
      calculateRelativePath('styles/main.css', 'assets/image.png'),
      '../assets/image.png',
    );
  });

  it('calculates relative path for deeply nested CSS', () => {
    assert.equal(
      calculateRelativePath('styles/components/button.css', 'assets/icons/arrow.svg'),
      '../../assets/icons/arrow.svg',
    );
  });

  it('calculates relative path when CSS is at root', () => {
    assert.equal(calculateRelativePath('main.css', 'assets/image.png'), 'assets/image.png');
  });

  it('calculates relative path when both are deeply nested', () => {
    assert.equal(
      calculateRelativePath('a/b/c/style.css', 'x/y/z/image.png'),
      '../../../x/y/z/image.png',
    );
  });
});
