import { EventEmitter } from '@web/test-runner-core';
import logUpdate from 'log-update';
import cliCursor from 'cli-cursor';

const CLEAR_COMMAND = process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H';

interface EventMap {
  input: string;
}

export class Terminal extends EventEmitter<EventMap> {
  private originalFunctions: Partial<Record<keyof Console, (...args: any[]) => any>> = {};
  private previousDynamic: string[] = [];
  private started = false;
  public isInteractive = process.stdout.isTTY;

  start() {
    // start off with an empty line
    console.log('');

    for (const key of Object.keys(console) as (keyof Console)[]) {
      if (typeof console[key] === 'function') {
        this.originalFunctions[key] = console[key];

        console[key] = new Proxy(console[key], {
          apply: (target, thisArg, argArray) => {
            // when a console function is called, clear dynamic logs
            logUpdate.clear();

            // do regular console log
            target.apply(thisArg, argArray);

            // rerender dynamic logs
            this.relogDynamic();
          },
        });
      }
    }

    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (input: string) => {
      this.emit('input', input);
    });
    this.started = true;
  }

  observeDirectInput() {
    if (!this.isInteractive) {
      throw new Error('Cannot observe input in a non-interactive (TTY) terminal.');
    }

    if (typeof process.stdin.setRawMode === 'function') {
      process.stdin.setRawMode(true);
    }
    cliCursor.hide();
  }

  observeConfirmedInput() {
    if (!this.isInteractive) {
      throw new Error('Cannot observe input in a non-interactive (TTY) terminal.');
    }

    if (typeof process.stdin.setRawMode === 'function') {
      process.stdin.setRawMode(false);
    }
    cliCursor.show();
  }

  stop() {
    logUpdate.done();

    for (const [key, fn] of Object.entries(this.originalFunctions)) {
      console[key as keyof Console] = fn;
    }
    this.started = false;
  }

  clear() {
    process.stdout.write(CLEAR_COMMAND);
    this.relogDynamic();
  }

  logStatic(entriesOrEntry: string | string[]) {
    const entries = Array.isArray(entriesOrEntry) ? entriesOrEntry : [entriesOrEntry];
    if (entries.length === 0) {
      return;
    }

    console.log(entries.join('\n'));
  }

  logPendingUserInput(string: string) {
    process.stdout.write(string);
  }

  logDynamic(entriesOrEntry: string | string[]) {
    const entries = Array.isArray(entriesOrEntry) ? entriesOrEntry : [entriesOrEntry];
    if (!this.started) {
      return;
    }

    this.previousDynamic = entries;
    logUpdate(entries.join('\n'));
  }

  private relogDynamic() {
    this.logDynamic(this.previousDynamic);
  }
}
