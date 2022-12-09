import { getIterator } from './iterator-utils.js';

//========== Types ==========

//SYNC: type Identity<T> = T;

declare global {

  interface AsyncIterator<T, TReturn = any, TNext = undefined> {
    map<U>(mapper: (value: T, counter: number) => U): AsyncIterator<U>;
    filter(filterer: (value: T, counter: number) => boolean): AsyncIterator<T>;
    take(limit: number): AsyncIterator<T>;
    drop(limit: number): AsyncIterator<T>;
    flatMap<U>(mapper: (value: T, counter: number) => Array<U>): AsyncIterator<U>;
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

  interface AsyncIteratorConstructor {
    new <T, TReturn = any, TNext = undefined>(): AsyncIterator<T, TReturn, TNext>;
    readonly prototype: AsyncIterator<object>;
  }

  var AsyncIterator: AsyncIteratorConstructor;

} // declare global

/*########## BEGIN ##########*/ if (!globalThis.AsyncIterator) {

//========== Prototype methods ==========

const NO_INITIAL_VALUE = Symbol('NO_INITIAL_VALUE');

abstract class Methods<T, TReturn = any, TNext = undefined> implements AsyncIterator<T, TReturn, TNext> {
  abstract next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>>;
  abstract [Symbol.asyncIterator](): AsyncIterator<T>;

  async * map<U>(mapper: (value: T, counter: number) => U): AsyncIterator<U> {
    let counter = 0;
    for await (const value of this) {
      yield mapper(value, counter);
      counter++;
    }
  }

  async * filter(filterer: (value: T, counter: number) => boolean): AsyncIterator<T> {
    let counter = 0;
    for await (const value of this) {
      if (filterer(value, counter)) {
        yield value;
      }
      counter++;
    }
  }

  async * take(limit: number): AsyncIterator<T> {
    let counter = 0;
    for await (const value of this) {
      if (counter >= limit) break;
      yield value;
      counter++;
    }
  }

  async * drop(limit: number): AsyncIterator<T> {
    let counter = 0;
    for await (const value of this) {
      if (counter >= limit) {
        yield value;
      }
      counter++;
    }
  }

  async * flatMap<U>(mapper: (value: T, counter: number) => Array<U>): AsyncIterator<U> {
    let counter = 0;
    for await (const value of this) {
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
    for await (const value of this) {
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
    for await (const x of this) {
      result.push(x);
    }
    return result;
  }
  async forEach(fn: (value: T, counter: number) => void): Promise<void> {
    let counter = 0;
    for await (const value of this) {
      fn(value, counter);
      counter++;
    }
  }
  async some(fn: (value: T, counter: number) => boolean): Promise<boolean> {
    let counter = 0;
    for await (const value of this) {
      if (fn(value, counter)) {
        return true;
      }
      counter++;
    }
    return false;
  }
  async every(fn: (value: T, counter: number) => boolean): Promise<boolean> {
    let counter = 0;
    for await (const value of this) {
      if (!fn(value, counter)) {
        return false;
      }
      counter++;
    }
    return true;
  }
  async find(fn: (value: T, counter: number) => boolean): Promise<undefined | T> {
    let counter = 0;
    for await (const value of this) {
      if (fn(value, counter)) {
        return value;
      }
      counter++;
    }
    return undefined;
  }
  //SYNC: a❌sync * toAsync() {yield* this}
};

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

//========== Static method ==========
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
  const iterator = getIterator<AsyncIterator<T>>(value, "async"); // different quotes for `npm run syncify`
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

/*########## END ##########*/ }