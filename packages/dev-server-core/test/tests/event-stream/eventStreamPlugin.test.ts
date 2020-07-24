import fetch from 'node-fetch';
import { expect } from 'chai';

import { createTestServer } from '../helpers';
import { eventStreamScript } from '../../../src/event-stream/eventStreamPlugin';

describe('eventStreamPlugin', () => {
  it('injects an event stream script if a plugin has inject set and event stream is enabled', async () => {
    const { server, host } = await createTestServer({
      eventStream: true,
      plugins: [
        {
          name: 'test',
          injectEventStream: true,
        },
      ],
    });

    try {
      const response = await fetch(`${host}/index.html`);
      const body = await response.text();

      expect(response.status).to.equal(200);
      expect(body).to.include(eventStreamScript);
    } finally {
      server.stop();
    }
  });

  it('does not inject an event stream script if a plugin has inject set and event stream is disabled', async () => {
    const { server, host } = await createTestServer({
      eventStream: false,
      plugins: [
        {
          name: 'test',
          injectEventStream: true,
        },
      ],
    });

    try {
      const response = await fetch(`${host}/index.html`);
      const body = await response.text();

      expect(response.status).to.equal(200);
      expect(body).to.not.include(eventStreamScript);
    } finally {
      server.stop();
    }
  });

  it('does not inject event stream script is no plugin has inject set', async () => {
    const { server, host } = await createTestServer();
    try {
      const response = await fetch(`${host}/index.html`);
      const body = await response.text();

      expect(response.status).to.equal(200);
      expect(body).to.not.include(eventStreamScript);
    } finally {
      server.stop();
    }
  });

  it('does not inject event stream script into html fragments without html or body', async () => {
    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          injectEventStream: true,
        },
      ],
    });

    try {
      const responseA = await fetch(`${host}/html-fragment-a.html`);
      const responseB = await fetch(`${host}/html-fragment-b.html`);
      const bodyA = await responseA.text();
      const bodyB = await responseB.text();

      expect(responseA.status).to.equal(200);
      expect(responseB.status).to.equal(200);
      expect(bodyA).to.not.include(eventStreamScript);
      expect(bodyB).to.not.include(eventStreamScript);
    } finally {
      server.stop();
    }
  });
});
