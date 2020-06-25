import { render } from 'preact';

export function fixture(jsx) {
  const wrapper = document.createElement('div');
  render(jsx, wrapper);
  return {
    element: wrapper.firstElementChild,
    restoreFixture: () => wrapper.remove(),
  };
}
