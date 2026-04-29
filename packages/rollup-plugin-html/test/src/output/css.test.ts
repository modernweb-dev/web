import { expect } from 'chai';
import {
  createAssetPlaceholder,
  replacePlaceholders,
  calculateRelativePath,
} from '../../../src/output/css.js';

describe('cssAssetPlaceholders', () => {
  describe('createAssetPlaceholder', () => {
    it('creates a placeholder with the given reference ID', () => {
      expect(createAssetPlaceholder('abc123')).to.equal('__ROLLUP_ASSET_URL_abc123__');
    });
  });

  describe('replacePlaceholders', () => {
    it('replaces placeholders with resolved paths', () => {
      const css = `.foo { background: url('__ROLLUP_ASSET_URL_abc123__'); }`;
      const resolver = (refId: string) => (refId === 'abc123' ? '../assets/image.png' : undefined);
      const result = replacePlaceholders(css, resolver);
      expect(result).to.equal(`.foo { background: url('../assets/image.png'); }`);
    });

    it('preserves fragments after placeholder', () => {
      const css = `.foo { background: url('__ROLLUP_ASSET_URL_abc123__#icon'); }`;
      const resolver = () => '../assets/sprite.svg';
      const result = replacePlaceholders(css, resolver);
      expect(result).to.equal(`.foo { background: url('../assets/sprite.svg#icon'); }`);
    });

    it('preserves query strings after placeholder', () => {
      const css = `.foo { src: url('__ROLLUP_ASSET_URL_abc123__?v=1.0'); }`;
      const resolver = () => '../fonts/font.woff2';
      const result = replacePlaceholders(css, resolver);
      expect(result).to.equal(`.foo { src: url('../fonts/font.woff2?v=1.0'); }`);
    });

    it('keeps placeholder when resolver returns undefined', () => {
      const css = `.foo { background: url('__ROLLUP_ASSET_URL_unknown__'); }`;
      const resolver = () => undefined;
      const result = replacePlaceholders(css, resolver);
      expect(result).to.equal(css);
    });

    it('replaces multiple placeholders', () => {
      const css = `
        .a { background: url('__ROLLUP_ASSET_URL_img1__'); }
        .b { background: url('__ROLLUP_ASSET_URL_img2__'); }
      `;
      const resolver = (refId: string) => {
        if (refId === 'img1') return 'assets/image1.png';
        if (refId === 'img2') return 'assets/image2.png';
        return undefined;
      };
      const result = replacePlaceholders(css, resolver);
      expect(result).to.include("url('assets/image1.png')");
      expect(result).to.include("url('assets/image2.png')");
    });
  });

  describe('calculateRelativePath', () => {
    it('calculates relative path for same directory', () => {
      expect(calculateRelativePath('styles/main.css', 'styles/image.png')).to.equal('image.png');
    });

    it('calculates relative path for parent directory', () => {
      expect(calculateRelativePath('styles/main.css', 'image.png')).to.equal('../image.png');
    });

    it('calculates relative path for sibling directory', () => {
      expect(calculateRelativePath('styles/main.css', 'assets/image.png')).to.equal(
        '../assets/image.png',
      );
    });

    it('calculates relative path for deeply nested CSS', () => {
      expect(
        calculateRelativePath('styles/components/button.css', 'assets/icons/arrow.svg'),
      ).to.equal('../../assets/icons/arrow.svg');
    });

    it('calculates relative path when CSS is at root', () => {
      expect(calculateRelativePath('main.css', 'assets/image.png')).to.equal('assets/image.png');
    });

    it('calculates relative path when both are deeply nested', () => {
      expect(calculateRelativePath('a/b/c/style.css', 'x/y/z/image.png')).to.equal(
        '../../../x/y/z/image.png',
      );
    });
  });
});
