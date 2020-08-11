import fetch from 'node-fetch';
import AbortController from 'abort-controller';
import { expect } from 'chai';

import { EVENT_STREAM_ENDPOINT } from '../../src/event-stream/eventStreamMiddleware';
import { createTestServer, timeout } from '../helpers';
import { EventStreamManager } from '../../src/event-stream/EventStreamManager';

describe('eventStreamMiddleware', () => {
  it('responds with an event stream', async () => {
    const { server, host } = await createTestServer();
    const controller = new AbortController();

    try {
      const response = await fetch(`${host}${EVENT_STREAM_ENDPOINT}`, {
        signal: controller.signal,
      });
      const received: any[] = [];

      response.body!.on('data', data => {
        received.push(data.toString());
      });

      await timeout();
      expect(received).to.eql(['event: start\ndata: ""\n\n']);
    } finally {
      server.stop();
      controller.abort();
    }
  });

  it('receives events from the event stream', async () => {
    let eventStreams: EventStreamManager | undefined = undefined;

    const { server, host } = await createTestServer({
      plugins: [
        {
          name: 'test',
          serverStart(config) {
            eventStreams = config.eventStreams;
          },
        },
      ],
    });
    const controller = new AbortController();
    try {
      const response = await fetch(`${host}${EVENT_STREAM_ENDPOINT}`, {
        signal: controller.signal,
      });
      const received: any[] = [];

      response.body!.on('data', data => {
        received.push(data.toString());
      });

      await timeout();
      expect(received).to.eql(['event: start\ndata: ""\n\n']);
      eventStreams!.sendMessageEvent('my message');

      await timeout();
      expect(received).to.eql([
        'event: start\ndata: ""\n\n',
        'event: message\ndata: "my message"\n\n',
      ]);
      eventStreams!.sendRunEvent('./foo.js', [{ foo: 'bar' }, 'x']);

      await timeout();
      expect(received).to.eql([
        'event: start\ndata: ""\n\n',
        'event: message\ndata: "my message"\n\n',
        'event: run\ndata: {"path":"./foo.js","args":[{"foo":"bar"},"x"]}\n\n',
      ]);
    } finally {
      server.stop();
      controller.abort();
    }
  });
});
