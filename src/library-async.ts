import * as util from './util.js';
//SYNC: import { XAsync❌Iterator } from './library-async.js';

//========== Types ==========

//SYNC: type __ValueIdentity__<T> = T;

export interface IAsyncIterator<T, TReturn = any, TNext = undefined> {
  [Symbol.asyncIterator](): AsyncIterator<T, TReturn, TNext>;
  next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;

  map<U>(mapper: (value: T, counter: number) => U): AsyncIterator<U>;
  filter(filterer: (value: T, counter: number) => boolean): AsyncIterator<T>;
  take(limit: number): AsyncIterator<T>;
  drop(limit: number): AsyncIterator<T>;
  flatMap<U>(mapper: (value: T, counter: number) => Iterable<U>): AsyncIterator<U>;
  reduce<U>(
    reducer: (accumulator: U, value: T, counter: number) => U,
    initialValue?: U
  ): Promise<U>;
  toArray(): Promise<Array<T>>;
  forEach(fn: (value: T, counter: number) => void): Promise<void>;
  some(fn: (value: T, counter: number) => boolean): Promise<boolean>;
  every(fn: (value: T, counter: number) => boolean): Promise<boolean>;
  find(fn: (value: T, counter: number) => boolean): Promise<undefined | T>;
  //SYNC: toAsync(): Async❌Iterator<T>;
}

//========== Prototype methods ==========

const NO_INITIAL_VALUE = Symbol('NO_INITIAL_VALUE');

/**
 * The return type `AsyncIterator<U>` is good enough in “polyfill mode”.
 * In “library mode”, these methods are wrapped anyway.
 */
export abstract class AbstractAsyncIterator<T, TReturn = any, TNext = undefined> implements IAsyncIterator<T, TReturn, TNext> {
  abstract [Symbol.asyncIterator](): AsyncIterator<T, TReturn, TNext>;
  abstract next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;

  async * map<U>(mapper: (value: T, counter: number) => U): AsyncIterator<U> {
    let counter = 0;
    for await (const value of this as unknown as AsyncIterable<T>) {
      yield mapper(value, counter);
      counter++;
    }
  }

  async * filter(filterer: (value: T, counter: number) => boolean): AsyncIterator<T> {
    let counter = 0;
    for await (const value of this as unknown as AsyncIterable<T>) {
      if (filterer(value, counter)) {
        yield value;
      }
      counter++;
    }
  }

  async * take(limit: number): AsyncIterator<T> {
    let counter = 0;
    for await (const value of this as unknown as AsyncIterable<T>) {
      if (counter >= limit) break;
      yield value;
      counter++;
    }
  }

  async * drop(limit: number): AsyncIterator<T> {
    let counter = 0;
    for await (const value of this as unknown as AsyncIterable<T>) {
      if (counter >= limit) {
        yield value;
      }
      counter++;
    }
  }

  async * flatMap<U>(mapper: (value: T, counter: number) => Iterable<U>): AsyncIterator<U> {
    let counter = 0;
    for await (const value of this as unknown as AsyncIterable<T>) {
      yield* mapper(value, counter);
      counter++;
    }
  }

  async reduce<U>(
    reducer: (accumulator: U, value: T, counter: number) => U,
    initialValue: typeof NO_INITIAL_VALUE | U = NO_INITIAL_VALUE
  ): Promise<U> {
    let accumulator = initialValue;
    let counter = 0;
    for await (const value of this as unknown as AsyncIterable<T>) {
      if (accumulator === NO_INITIAL_VALUE) {
        accumulator = value as any;
        continue;
      }
      accumulator = reducer(accumulator, value, counter);
      counter++;
    }
    if (accumulator === NO_INITIAL_VALUE) {
      throw new TypeError('Must specify an initialValue if the iterable is empty.');
    }
    return accumulator;  
  }
  async toArray(): Promise<Array<T>> {
    const result = [];
    for await (const x of this as unknown as AsyncIterable<T>) {
      result.push(x);
    }
    return result;
  }
  async forEach(fn: (value: T, counter: number) => void): Promise<void> {
    let counter = 0;
    for await (const value of this as unknown as AsyncIterable<T>) {
      fn(value, counter);
      counter++;
    }
  }
  async some(fn: (value: T, counter: number) => boolean): Promise<boolean> {
    let counter = 0;
    for await (const value of this as unknown as AsyncIterable<T>) {
      if (fn(value, counter)) {
        return true;
      }
      counter++;
    }
    return false;
  }
  async every(fn: (value: T, counter: number) => boolean): Promise<boolean> {
    let counter = 0;
    for await (const value of this as unknown as AsyncIterable<T>) {
      if (!fn(value, counter)) {
        return false;
      }
      counter++;
    }
    return true;
  }
  async find(fn: (value: T, counter: number) => boolean): Promise<undefined | T> {
    let counter = 0;
    for await (const value of this as unknown as AsyncIterable<T>) {
      if (fn(value, counter)) {
        return value;
      }
      counter++;
    }
    return undefined;
  }
  //SYNC: a❌sync * toAsync(): Async❌Iterator<T> {yield* this as any}
};

//========== Library class ==========

export class XAsyncIterator<T> extends AbstractAsyncIterator<T> {
  static from<U>(iterableOrIterator: util.LegacyIterable<U> | util.LegacyAsyncIterable<U> | util.LegacyAsyncIterator<U>): XAsyncIterator<U> {
    const iterator = util.GetIteratorFlattenable<AsyncIterator<U>>(iterableOrIterator as unknown as Record<symbol,any>, "async"); // different quotes for `npm run syncify`
    if (iterator instanceof XAsyncIterator) {
      return iterator;
    }
    return new XAsyncIterator( iterator );
  }

  #iterator;

  private constructor(iterator: util.LegacyAsyncIterator<T>) {
    super();
    this.#iterator = iterator;
  }

  //----- Implemented abstract methods -----

  next(): Promise<IteratorResult<T>> {
    return this.#iterator.next();
  }
  [Symbol.asyncIterator](): XAsyncIterator<T> {
    return this;
  }

  //----- Overidden methods -----

  override map<U>(mapper: (value: T, counter: number) => U): XAsyncIterator<U> {
    return XAsyncIterator.from(super.map(mapper));
  }

  override filter(filterer: (value: T, counter: number) => boolean): XAsyncIterator<T> {
    return XAsyncIterator.from(super.filter(filterer));
  }

  override take(limit: number): XAsyncIterator<T> {
    return XAsyncIterator.from(super.take(limit));
  }

  override drop(limit: number): XAsyncIterator<T> {
    return XAsyncIterator.from(super.drop(limit));
  }

  override flatMap<U>(mapper: (value: T, counter: number) => Iterable<U>): XAsyncIterator<U> {
    return XAsyncIterator.from(super.flatMap(mapper));
  }

  //SYNC: override toAsync(): XAsync❌Iterator<T> {return XAsync❌Iterator.from(super.toAsync())}
}
