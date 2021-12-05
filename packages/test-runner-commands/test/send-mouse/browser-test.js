import { sendMouse } from '../../browser/commands.mjs';
import { expect } from '../chai.js';

function spyEvent() {
  let events = [];

  const callback = event => events.push(event);
  callback.getEvents = () => events;
  callback.getLastEvent = () => events[events.length - 1];
  callback.resetHistory = () => {
    events = [];
  };

  return callback;
}

let element, x, y;

beforeEach(() => {
  element = document.createElement('div');
  element.style.width = '100px';
  element.style.height = '100px';
  element.style.margin = '100px';

  x = 150; // Horizontal middle of the element.
  y = 150; // Vertical middle of the element.

  document.body.appendChild(element);
});

afterEach(() => {
  element.remove();
});

describe('move', () => {
  let spy;

  beforeEach(() => {
    spy = spyEvent();
    document.addEventListener('mousemove', spy);
  });

  afterEach(() => {
    document.removeEventListener('mousemove', spy);
  });

  it('can move mouse to a position', async () => {
    await sendMouse({ type: 'move', position: [x, y] });

    expect(spy.getLastEvent()).to.include({ x, y });
  });
});

describe('click', () => {
  let spy;

  beforeEach(async () => {
    spy = spyEvent();
    element.addEventListener('mousedown', spy);
    element.addEventListener('mouseup', spy);

    await sendMouse({ type: 'move', position: [0, 0] });
  });

  it('can click the left mouse button', async () => {
    await sendMouse({ type: 'click', position: [x, y], button: 'left' });

    expect(spy.getEvents()).to.have.lengthOf(2);
    expect(spy.getEvents()[0]).to.include({ type: 'mousedown', button: 0, x, y });
    expect(spy.getEvents()[1]).to.include({ type: 'mouseup', button: 0, x, y });
  });

  it('should click the left mouse button by default', async () => {
    await sendMouse({ type: 'click', position: [x, y] });

    expect(spy.getEvents()).to.have.lengthOf(2);
    expect(spy.getEvents()[0]).to.include({ type: 'mousedown', button: 0, x, y });
    expect(spy.getEvents()[1]).to.include({ type: 'mouseup', button: 0, x, y });
  });

  it('can click the middle mouse button', async () => {
    await sendMouse({ type: 'click', position: [x, y], button: 'middle' });

    expect(spy.getEvents()).to.have.lengthOf(2);
    expect(spy.getEvents()[0]).to.include({ type: 'mousedown', button: 1, x, y });
    expect(spy.getEvents()[1]).to.include({ type: 'mouseup', button: 1, x, y });
  });

  it('can click the right mouse button', async () => {
    await sendMouse({ type: 'click', position: [x, y], button: 'right' });

    expect(spy.getEvents()).to.have.lengthOf(2);
    expect(spy.getEvents()[0]).to.include({ type: 'mousedown', button: 2, x, y });
    expect(spy.getEvents()[1]).to.include({ type: 'mouseup', button: 2, x, y });
  });
});

describe('down and up', () => {
  let spy;

  beforeEach(async () => {
    spy = spyEvent();
    element.addEventListener('mousedown', spy);
    element.addEventListener('mouseup', spy);

    await sendMouse({ type: 'move', position: [x, y] });
  });

  it('can down and up the left mouse button', async () => {
    await sendMouse({ type: 'down', button: 'left' });

    expect(spy.getEvents()).to.have.lengthOf(1);
    expect(spy.getEvents()[0]).to.include({ type: 'mousedown', button: 0, x, y });

    spy.resetHistory();
    await sendMouse({ type: 'up', button: 'left' });

    expect(spy.getEvents()).to.have.lengthOf(1);
    expect(spy.getEvents()[0]).to.include({ type: 'mouseup', button: 0, x, y });
  });

  it('should down and up the left mouse button by default', async () => {
    await sendMouse({ type: 'down' });

    expect(spy.getEvents()).to.have.lengthOf(1);
    expect(spy.getEvents()[0]).to.include({ type: 'mousedown', button: 0, x, y });

    spy.resetHistory();
    await sendMouse({ type: 'up' });

    expect(spy.getEvents()).to.have.lengthOf(1);
    expect(spy.getEvents()[0]).to.include({ type: 'mouseup', button: 0, x, y });
  });

  it('can down and up the middle mouse button', async () => {
    await sendMouse({ type: 'down', button: 'middle' });

    expect(spy.getEvents()).to.have.lengthOf(1);
    expect(spy.getEvents()[0]).to.include({ type: 'mousedown', button: 1, x, y });

    spy.resetHistory();
    await sendMouse({ type: 'up', button: 'middle' });

    expect(spy.getEvents()).to.have.lengthOf(1);
    expect(spy.getEvents()[0]).to.include({ type: 'mouseup', button: 1, x, y });
  });

  it('can down and up the right mouse button', async () => {
    await sendMouse({ type: 'down', button: 'right' });

    expect(spy.getEvents()).to.have.lengthOf(1);
    expect(spy.getEvents()[0]).to.include({ type: 'mousedown', button: 2, x, y });

    spy.resetHistory();
    await sendMouse({ type: 'up', button: 'right' });

    expect(spy.getEvents()).to.have.lengthOf(1);
    expect(spy.getEvents()[0]).to.include({ type: 'mouseup', button: 2, x, y });
  });
});
