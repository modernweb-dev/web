import { expect } from '../../../../../node_modules/@esm-bundle/chai/esm/chai.js';

describe('timers test', () => {
  it('can call setTimeout', async () => {
    const promise = new Promise((resolve) => {
      window.setTimeout(() => {
        resolve();
      }, 0);
    });
    await promise;
  });

  it('can cancel setTimeout', async () => {
    let called = false;
    const timer = window.setTimeout(() => {
      called = true;
    }, 1);

    expect(typeof timer).to.equal('number');

    window.clearTimeout(timer);

    await new Promise((resolve) => {
      window.setTimeout(() => resolve(), 2);
    });

    expect(called).to.equal(false);
  });

  it('can call and cancel setInterval', async () => {
    let callCount = 0;

    const interval = window.setInterval(() => {
      callCount++;
    }, 1);

    await new Promise((resolve) => {
      window.setTimeout(() => resolve(), 2);
    });

    expect(callCount).to.be.greaterThan(0);

    const oldCallCount = callCount;

    window.clearInterval(interval);

    await new Promise((resolve) => {
      window.setTimeout(() => resolve(), 2);
    });

    expect(callCount).to.equal(oldCallCount);
  });

  it('can call requestAnimationFrame', async () => {
    const promise = new Promise((resolve) => {
      window.requestAnimationFrame(() => {
        resolve();
      });
    });
    await promise;
  });

  it('can cancel requestAnimationFrame', async () => {
    let called = false;

    const timer = window.requestAnimationFrame(() => {
      called = true;
    });

    expect(typeof timer).to.equal('number');

    window.cancelAnimationFrame(timer);

    await new Promise((resolve) => {
      window.setTimeout(() => resolve(), 2);
    });

    expect(called).to.equal(false);
  });
});
