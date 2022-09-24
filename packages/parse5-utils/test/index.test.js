const { expect } = require('chai');
const utils = require('../src/index');

describe('parse5-utils', () => {
  describe('appendToDocument', () => {
    it('injects a HTML snippet to the document', () => {
      const document = '<html><head></head><body></body></html>';
      const result = utils.appendToDocument(document, '<div>Hello world</div>');
      if (!result) throw new Error();
      expect(result).to.equal('<html><head></head><body><div>Hello world</div></body></html>');
    });

    it('injects after other elements', () => {
      const document =
        '<html><head><script>A</script></head><body><script>B</script><script>C</script></body></html>';
      const result = utils.appendToDocument(document, '<div>Hello world</div>');
      if (!result) throw new Error();
      expect(result).to.equal(
        '<html><head><script>A</script></head><body><script>B</script><script>C</script><div>Hello world</div></body></html>',
      );
    });

    it('injects into head if there is no body', () => {
      const document = '<html><head><script>A</script></head></html>';
      const result = utils.appendToDocument(document, '<div>Hello world</div>');
      if (!result) throw new Error();
      expect(result).to.equal('<html><head><script>A</script><div>Hello world</div></head></html>');
    });

    it('returns null if there is no head or body', () => {
      const document = '<html></html>';
      const result = utils.appendToDocument(document, '<div>A</div><div>B</div>');
      expect(result).to.equal('<html><head></head><body><div>A</div><div>B</div></body></html>');
    });
  });
});
