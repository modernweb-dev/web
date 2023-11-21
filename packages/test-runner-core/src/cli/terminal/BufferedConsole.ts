import { Writable } from 'node:stream';
import { Console } from 'node:console';

/**
 * Buffers console messages so that they can be flushed all at once.
 */
export class BufferedConsole {
  private buffer: any[] = [];
  private outStream = new Writable({
    write: (chunk, encoding, callback) => {
      callback();
      this.buffer.push(chunk);
    },
  });
  public console = new Console({ colorMode: true, stdout: this.outStream });

  flush() {
    // flush all pending console output
    for (const chunk of this.buffer) {
      process.stdout.write(chunk);
    }
    this.buffer = [];
  }
}
