console.log('console.log');
console.warn('console.warn');
console.debug('console.debug');
console.error('console.error');

console.log('Log', 'multiple', 'strings');
console.log('simple object', { a: '1', b: '2' });
console.log('nested', {
  a1: '1',
  b1: {
    a2: '1',
    b2: {
      a3: {
        a4: {
          a5: {
            a6: {
              a7: 'a7',
            },
          },
        },
      },
    },
    c2: '3',
  },
  c1: '3',
});
console.log('array', [{ a: 1, b: 2 }, 'some string', [1, 2, 3]]);

const div = document.createElement('div');
div.textContent = 'my div';
console.log('dom element', div);

const nestedDiv = document.createElement('div');
nestedDiv.innerHTML = `
  <style>
    :host {
      color: blue;
    }
  </style>

  <div>
    <div>
      <div>
        <span>hi</span>
      </div>
    </div>
  </div>
`;

console.log('nested dom elements', nestedDiv);

const mySymbol = Symbol('foo');
console.log('symbol', mySymbol);

const myComment = document.createComment('this is a HTML comment');
console.log(myComment);

const textNode = document.createTextNode('this is a text node');
console.log(textNode);

class Foo {}
const foo = new Foo();
foo.bar = 'buz';
foo.lorem = 'ipsum';

console.log(foo);

const url = new URL(window.location);
console.log(url);
console.log(url.searchParams);

console.log(undefined);
console.log(null);
console.log({ x: undefined });
console.log([undefined, null]);

describe('x', () => {
  it('y', async () => {
    await new Promise(r => setTimeout(r, 500));
    console.log('lazy logs');
  });
});
