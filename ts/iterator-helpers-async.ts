import { getAsyncIterator, GetIteratorFlattenable } from './iterator-utils.js';

//========== Prototype methods ==========

const NO_INITIAL_VALUE = Symbol('NO_INITIAL_VALUE');

abstract class Methods<T, TReturn = any, TNext = undefined> implements AsyncIterator<T, TReturn, TNext> {
  abstract next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;
  abstract [Symbol.asyncIterator](): AsyncIterator<T, TReturn, TNext>;

  async * map<U>(mapper: (value: T, counter: number) => U): AsyncIterator<U> {
    let counter = 0;
    for await (const value of this as AsyncIterable<T>) {
      yield mapper(value, counter);
      counter++;
    }
  }

  async * filter(filterer: (value: T, counter: number) => boolean): AsyncIterator<T> {
    let counter = 0;
    for await (const value of this as AsyncIterable<T>) {
      if (filterer(value, counter)) {
        yield value;
      }
      counter++;
    }
  }

  async * take(limit: number): AsyncIterator<T> {
    let counter = 0;
    for await (const value of this as AsyncIterable<T>) {
      if (counter >= limit) break;
      yield value;
      counter++;
    }
  }

  async * drop(limit: number): AsyncIterator<T> {
    let counter = 0;
    for await (const value of this as AsyncIterable<T>) {
      if (counter >= limit) {
        yield value;
      }
      counter++;
    }
  }

  async * flatMap<U>(mapper: (value: T, counter: number) => Iterable<U>): AsyncIterator<U> {
    let counter = 0;
    for await (const value of this as AsyncIterable<T>) {
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
    for await (const value of this as AsyncIterable<T>) {
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
    for await (const x of this as AsyncIterable<T>) {
      result.push(x);
    }
    return result;
  }
  async forEach(fn: (value: T, counter: number) => void): Promise<void> {
    let counter = 0;
    for await (const value of this as AsyncIterable<T>) {
      fn(value, counter);
      counter++;
    }
  }
  async some(fn: (value: T, counter: number) => boolean): Promise<boolean> {
    let counter = 0;
    for await (const value of this as AsyncIterable<T>) {
      if (fn(value, counter)) {
        return true;
      }
      counter++;
    }
    return false;
  }
  async every(fn: (value: T, counter: number) => boolean): Promise<boolean> {
    let counter = 0;
    for await (const value of this as AsyncIterable<T>) {
      if (!fn(value, counter)) {
        return false;
      }
      counter++;
    }
    return true;
  }
  async find(fn: (value: T, counter: number) => boolean): Promise<undefined | T> {
    let counter = 0;
    for await (const value of this as AsyncIterable<T>) {
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

export class XAsyncIterator<T> extends Methods<T> {
  static from<U>(iterableOrIterator: AsyncIterable<U> | AsyncIterator<U>): XAsyncIterator<U> {
    return new XAsyncIterator(
      getAsyncIterator(iterableOrIterator)
    );
  }

  #iterator;

  private constructor(iterator: AsyncIterator<T>) {
    super();
    this.#iterator = iterator;
  }

  //----- Implemented abstract methods -----

  next(): Promise<IteratorResult<T>> {
    return this.#iterator.next();
  }
  [Symbol.asyncIterator](): AsyncIterator<T> {
    return this;
  }

  //----- Overidden methods -----

  override map<U>(mapper: (value: T, counter: number) => U): AsyncIterator<U> {
    return XAsyncIterator.from(super.map(mapper));
  }

  override filter(filterer: (value: T, counter: number) => boolean): AsyncIterator<T> {
    return XAsyncIterator.from(super.filter(filterer));
  }

  override take(limit: number): AsyncIterator<T> {
    return XAsyncIterator.from(super.take(limit));
  }

  override drop(limit: number): AsyncIterator<T> {
    return XAsyncIterator.from(super.drop(limit));
  }

  override flatMap<U>(mapper: (value: T, counter: number) => Iterable<U>): AsyncIterator<U> {
    return XAsyncIterator.from(super.flatMap(mapper));
  }
}

//========== Polyfill ==========

export function installAsyncIteratorPolyfill() {

  globalThis.AsyncIterator = function () {} as unknown as AsyncIteratorConstructor;
  Object.defineProperty(
    AsyncIterator, 'prototype',
    {
      writable: false,
      enumerable: false,
      configurable: false,
      value: Object.getPrototypeOf(
        // Shared prototype of generators:
        Object.getPrototypeOf(
          (async function* () {}).prototype
        )
      ),
    }
  );

  //----- Prototype properties -----

  for (const key of Reflect.ownKeys(Methods.prototype)) {
    const value = (Methods.prototype as Record<string|symbol, any>)[key];
    Object.defineProperty(
      AsyncIterator.prototype, key,
      {
        writable: false,
        enumerable: false,
        configurable: true,
        value,
      }
    );
  }

  // SPEC: “Unlike the @@toStringTag on most built-in classes, for
  // web-compatibility reasons this property must be writable.”
  Object.defineProperty(
    AsyncIterator.prototype, Symbol.toStringTag,
    {
      value: 'AsyncIterator',
      writable: true,
      enumerable: false,
      configurable: true,
    }
  );

  //----- Static method -----
  // Must be done after AsyncIterator.prototype was set up,
  // so that `extends AsyncIterator` works below

  class WrappedAsyncIterator<T, TReturn = any, TNext = undefined> extends AsyncIterator<T, TReturn, TNext> {
    #iterator;
    constructor(iterator: AsyncIterator<T, TReturn, TNext>) {
      super();
      this.#iterator = iterator;
    }
    override next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>> {
      return this.#iterator.next(...args);
    }
    // `async` helps with line (*)
    override async return(value?: TReturn | PromiseLike<TReturn>): Promise<IteratorResult<T, TReturn>> {
      const returnMethod = this.#iterator.return;
      if (returnMethod === undefined) {
        return {done: true, value: value as any}; // (*)
      }
      return returnMethod.call(this.#iterator);
    }
  }

  function AsyncIterator_from<T>(value: any) {
    const iterator = GetIteratorFlattenable<AsyncIterator<T>>(value, "async"); // different quotes for `npm run syncify`
    if (iterator instanceof AsyncIterator) {
      return iterator;
    }
    // `iterator´ does not support the new API – wrap it so that it does
    return new WrappedAsyncIterator(iterator);
  }

  Object.defineProperty(
    AsyncIterator, 'from',
    {
      writable: true,
      enumerable: false,
      configurable: true,
      value: AsyncIterator_from,
    }
  );

} // installPolyfill