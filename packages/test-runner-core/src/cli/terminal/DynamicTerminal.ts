import logUpdate from 'log-update';
import cliCursor from 'cli-cursor';

import { BufferedConsole } from './BufferedConsole';
import { EventEmitter } from '../../utils/EventEmitter';

const CLEAR_COMMAND = process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H';

interface EventMap {
  input: string;
}

export class DynamicTerminal extends EventEmitter<EventMap> {
  private originalFunctions: Partial<Record<keyof Console, (...args: any[]) => any>> = {};
  private previousDynamic: string[] = [];
  private started = false;
  private bufferedConsole = new BufferedConsole();
  private pendingConsoleFlush = false;
  public isInteractive = process.stdout.isTTY;

  start() {
    // start off with an empty line
    console.log('');

    this.interceptConsoleOutput();
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.addListener('data', this.onStdInData);
    this.started = true;
  }

  private onStdInData = (input: string) => {
    this.emit('input', input);
  };

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
    this.flushConsoleOutput();
    logUpdate.done();

    for (const [key, fn] of Object.entries(this.originalFunctions)) {
      console[key as keyof Console] = fn;
    }
    this.started = false;
    process.stdin.pause();
    process.stdin.removeListener('data', this.onStdInData);
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

  /**
   * Intercepts console output, piping all output to a buffered console instead.
   * Console messages are piped to the regular console at intervals. This is necessary
   * because when logging regular console messages the progress bar needs to be removes
   * and added back at the bottom. The time between this must be as minimal as possible.
   * Regular console logging can take a noticeable amount of time to compute object highlighting
   * and formatting. This causes the progress bar to flicker. Pre-computing the formatting
   * prevents this.
   */
  private interceptConsoleOutput() {
    for (const key of Object.keys(console) as (keyof Console)[]) {
      if (typeof console[key] === 'function') {
        this.originalFunctions[key] = console[key];

        console[key] = new Proxy(console[key], {
          apply: (target, thisArg, argArray) => {
            this.bufferedConsole.console[key](...argArray);
            if (this.pendingConsoleFlush) {
              return;
            }

            this.pendingConsoleFlush = true;
            setTimeout(() => {
              this.flushConsoleOutput();
            }, 0);
          },
        });
      }
    }
  }

  private flushConsoleOutput() {
    // clear progress bar
    logUpdate.clear();
    // log static console messages
    this.bufferedConsole.flush();
    // put progress bar back
    this.relogDynamic();
    this.pendingConsoleFlush = false;
  }

  private relogDynamic() {
    this.logDynamic(this.previousDynamic);
  }
}
