import { expect } from 'chai';
import * as utils from '../src/utils';

describe('isHtmlFragment()', () => {
  it('returns whether a HTML string is a fragment', () => {
    expect(utils.isHtmlFragment('<my-element></my-element>')).to.equal(true);
    expect(utils.isHtmlFragment('')).to.equal(true);
    expect(utils.isHtmlFragment('foo')).to.equal(true);
    expect(utils.isHtmlFragment('<div></div>')).to.equal(true);
    expect(utils.isHtmlFragment('<!-- COMMENT --><!DOCTYPE><my-element></my-element>')).to.equal(
      false,
    );
    expect(
      utils.isHtmlFragment(`<!--
    COMMENT
    --><!DOCTYPE><my-element></my-element>`),
    ).to.equal(false);
    expect(utils.isHtmlFragment('<!DOCTYPE><my-element></my-element>')).to.equal(false);
    expect(utils.isHtmlFragment('  <!DOCTYPE><my-element></my-element>')).to.equal(false);
    expect(utils.isHtmlFragment('  <html><my-element></my-element></html>')).to.equal(false);
    expect(utils.isHtmlFragment('  <body><my-element></my-element></body>')).to.equal(false);
    expect(utils.isHtmlFragment('  <head><my-element></my-element></head>')).to.equal(false);
  });
});
