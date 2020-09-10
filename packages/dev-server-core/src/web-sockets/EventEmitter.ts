import { EventEmitter as NodeEventEmitter } from 'events';

type EventMap = Record<string, any>;

type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}

export class EventEmitter<T extends EventMap> implements Emitter<T> {
  private __emitter = new NodeEventEmitter();
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
    this.__emitter.on(eventName, fn);
  }

  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
    this.__emitter.off(eventName, fn);
  }

  emit<K extends EventKey<T>>(eventName: K, params?: T[K]) {
    this.__emitter.emit(eventName, params);
  }
}
