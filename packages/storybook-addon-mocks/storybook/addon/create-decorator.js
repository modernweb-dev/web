// @ts-nocheck

import { registerMockRoutes } from '../../browser.js';

export function createDecorator(addons, makeDecorator) {
  addons.getChannel().on('mocks:edited', data => {
    const url = new URL(window.location);
    const mocks = encodeURIComponent(JSON.stringify(data));
    url.searchParams.set('mocks', mocks);
    window.location.href = url.href;
  });

  return makeDecorator({
    name: 'withMocks',
    parameterName: 'mocks',
    wrapper: (getStory, context) => {
      const mocks = context.parameters?.mocks ?? context.story?.parameters?.mocks ?? [];

      const editedMocks = getEditedMocks() ?? [];

      if (Array.isArray(mocks)) {
        const finalizedMocks = mocks.map(mock => {
          const editedMock = editedMocks.find(
            edited => edited.method === mock.method && edited.endpoint === mock.endpoint,
          );

          return editedMock
            ? {
                ...editedMock,
                handler: () =>
                  new Response(JSON.stringify(editedMock.data), {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    status: editedMock.status,
                  }),
              }
            : mock;
        });

        if (finalizedMocks) {
          addons.getChannel().emit('mocks:loaded', finalizedMocks.flat(Infinity));
          registerMockRoutes(finalizedMocks);
        }
      }

      return getStory(context);
    },
  });
}

function getEditedMocks() {
  const url = new URL(window.location);

  if (!url.searchParams.has('mocks')) {
    return null;
  }

  const param = url.searchParams.get('mocks');
  url.searchParams.delete('mocks');
  window.history.replaceState(null, '', `${url.search}`);

  try {
    return JSON.parse(decodeURIComponent(param));
  } catch (error) {
    throw new Error(`Cannot parse mocks: ${error.message}`);
  }
}
