import Stream from 'stream';

export class EventStream extends Stream.Transform {
  sendEvent(name: string, data: unknown = '') {
    this.write(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  _transform(data: string, enc: unknown, cb: () => void) {
    this.push(data.toString());
    cb();
  }
}
