import { sendMouse } from '../../browser/commands.mjs';
import { expect } from '../chai.js';

function spyEvent() {
  const events = [];

  const callback = event => events.push(event);
  callback.getEvents = () => events;
  callback.getLastEvent = () => events[events.length - 1];

  return callback;
}

function getMiddleOfElement(element) {
  const { top, left, width, height } = element.getBoundingClientRect();

  return [left + window.pageXOffset + height / 2, top + window.pageYOffset + width / 2];
}

let div;

before(() => {
  document.body.style.display = 'flex';
  document.body.style.alignItems = 'center';
  document.body.style.justifyContent = 'center';
  document.body.style.height = '100vh';

  div = document.createElement('div');
  div.style.width = '100px';
  div.style.height = '100px';

  document.body.appendChild(div);
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
    const [x, y] = getMiddleOfElement(div);

    await sendMouse({ type: 'move', position: [x, y] });

    expect(spy.getLastEvent()).to.include({ pageX: x, pageY: y });
  });
});

describe('click', () => {
  let spy;

  beforeEach(() => {
    spy = spyEvent();
    div.addEventListener('mousedown', spy);
    div.addEventListener('mouseup', spy);
    div.addEventListener('click', spy);
  });

  afterEach(() => {
    div.addEventListener('mousedown', spy);
    div.addEventListener('mouseup', spy);
    div.addEventListener('click', spy);
  });

  it('can click mouse button', async () => {
    const [x, y] = getMiddleOfElement(div);

    await sendMouse({ type: 'click', position: [x, y] });

    expect(spy.getEvents()).to.have.lengthOf(3);
    expect(spy.getEvents()[0]).to.include({ type: 'mousedown', pageX: x, pageY: y });
    expect(spy.getEvents()[1]).to.include({ type: 'mouseup', pageX: x, pageY: y });
    expect(spy.getEvents()[2]).to.include({ type: 'click' });
  });
});

describe('down and up', () => {
  let spy, x, y;

  beforeEach(async () => {
    spy = spyEvent();
    div.addEventListener('mousedown', spy);
    div.addEventListener('mouseup', spy);
    div.addEventListener('click', spy);

    [x, y] = getMiddleOfElement(div);

    await sendMouse({
      type: 'move',
      position: [x, y],
    });
  });

  afterEach(() => {
    div.addEventListener('mousedown', spy);
    div.addEventListener('mouseup', spy);
    div.addEventListener('click', spy);
  });

  it('can down mouse button', async () => {
    await sendMouse({ type: 'down' });

    expect(spy.getEvents()).to.have.lengthOf(1);
    expect(spy.getEvents()[0]).to.include({ type: 'mousedown', pageX: x, pageY: y });
  });

  it('can down and up mouse button', async () => {
    await sendMouse({ type: 'down' });
    await sendMouse({ type: 'up' });

    expect(spy.getEvents()).to.have.lengthOf(3);
    expect(spy.getEvents()[0]).to.include({ type: 'mousedown', pageX: x, pageY: y });
    expect(spy.getEvents()[1]).to.include({ type: 'mouseup', pageX: x, pageY: y });
    expect(spy.getEvents()[2]).to.include({ type: 'click' });
  });
});
