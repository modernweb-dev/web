import { EventStream } from './EventStream';
import { Context } from 'koa';

export interface MessageArgs {
  name: string;
  data?: string;
}

export class EventStreamManager {
  private activeStreams = new Set<EventStream>();
  private pendingMessages = new Map<string, number>();

  createEventStream(context: Context) {
    const eventStream = new EventStream();
    context.type = 'text/event-stream; charset=utf-8';
    context.set('Cache-Control', 'no-cache, no-transform');
    context.socket.setTimeout(0);
    context.socket.setNoDelay(true);
    context.socket.setKeepAlive(true);

    context.body = eventStream;
    eventStream.sendEvent('start');

    this.activeStreams.add(eventStream);
    eventStream.addListener('close', () => {
      this.activeStreams.delete(eventStream);
    });

    const now = Date.now();
    // send error messages that occurred within 1sec before opening the new
    // message channel. this helps catch errors that happen while loading a
    // page when the message channel is not set up yet
    for (const [message, timestamp] of this.pendingMessages) {
      if (now - timestamp <= 1000) {
        eventStream.sendEvent('message', message);
      }
    }
    this.pendingMessages.clear();
  }

  sendRunEvent(path: string, args: unknown[] = []) {
    for (const stream of this.activeStreams) {
      stream.sendEvent('run', { path, args });
    }
  }

  sendMessageEvent(message: string) {
    this.pendingMessages.set(message, Date.now());

    for (const stream of this.activeStreams) {
      stream.sendEvent('message', message);
    }
  }
}
