import '../../../../../../node_modules/chai/chai.js';
import styles from './my-styles.css';

const { expect } = window.chai;

describe('postcss', () => {
  it('can import css modules', () => {
    expect(styles).to.exist;
  });

  it('exports scoped classes', () => {
    expect(styles.foo).to.be.a('string');
    expect(styles.bar).to.be.a('string');
  });

  it('the styles are injected in the document head', () => {
    const styleTag = document.head.querySelector('style');
    expect(styleTag).to.exist;
    expect(styleTag.textContent).to.include('color: blue;');
    expect(styleTag.textContent).to.include('color: red;');
    expect(styleTag.textContent).to.include(styles.foo);
    expect(styleTag.textContent).to.include(styles.bar);
  });
});
