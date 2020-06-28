import { Middleware } from 'koa';
import { EventStreamManager } from './EventStreamManager';

export const EVENT_STREAM_ENDPOINT = '/__web-dev-server__/event-stream';

export function eventStreamMiddleware(eventStream: EventStreamManager): Middleware {
  return (context, next) => {
    if (context.path === EVENT_STREAM_ENDPOINT) {
      eventStream.createEventStream(context);
      return;
    }

    return next();
  };
}
