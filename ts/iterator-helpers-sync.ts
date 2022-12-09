import { getIterator } from './iterator-utils.js';

//========== Types ==========

type Identity<T> = T;

declare global {

  interface Iterator<T, TReturn = any, TNext = undefined> {
    map<U>(mapper: (value: T, counter: number) => U): Iterator<U>;
    filter(filterer: (value: T, counter: number) => boolean): Iterator<T>;
    take(limit: number): Iterator<T>;
    drop(limit: number): Iterator<T>;
    flatMap<U>(mapper: (value: T, counter: number) => Array<U>): Iterator<U>;
    reduce<U>(
      reducer: (accumulator: U, value: T, counter: number) => U,
      initialValue?: U
    ): Identity<U>;
    toArray(): Identity<Array<T>>;
    forEach(fn: (value: T, counter: number) => void): Identity<void>;
    some(fn: (value: T, counter: number) => boolean): Identity<boolean>;
    every(fn: (value: T, counter: number) => boolean): Identity<boolean>;
    find(fn: (value: T, counter: number) => boolean): Identity<undefined | T>;
    toAsync(): AsyncIterator<T>;
  }

  interface IteratorConstructor {
    new <T, TReturn = any, TNext = undefined>(): Iterator<T, TReturn, TNext>;
    readonly prototype: Iterator<object>;
  }

  var Iterator: IteratorConstructor;

} // declare global

/*########## BEGIN ##########*/ if (!globalThis.Iterator) {

//========== Prototype methods ==========

const NO_INITIAL_VALUE = Symbol('NO_INITIAL_VALUE');

abstract class Methods<T, TReturn = any, TNext = undefined> implements Iterator<T, TReturn, TNext> {
  abstract next(...args: [] | [TNext]): Identity<IteratorResult<T, TReturn>>;
  abstract [Symbol.iterator](): Iterator<T>;

  * map<U>(mapper: (value: T, counter: number) => U): Iterator<U> {
    let counter = 0;
    for (const value of this) {
      yield mapper(value, counter);
      counter++;
    }
  }

  * filter(filterer: (value: T, counter: number) => boolean): Iterator<T> {
    let counter = 0;
    for (const value of this) {
      if (filterer(value, counter)) {
        yield value;
      }
      counter++;
    }
  }

  * take(limit: number): Iterator<T> {
    let counter = 0;
    for (const value of this) {
      if (counter >= limit) break;
      yield value;
      counter++;
    }
  }

  * drop(limit: number): Iterator<T> {
    let counter = 0;
    for (const value of this) {
      if (counter >= limit) {
        yield value;
      }
      counter++;
    }
  }

  * flatMap<U>(mapper: (value: T, counter: number) => Array<U>): Iterator<U> {
    let counter = 0;
    for (const value of this) {
      yield* mapper(value, counter);
      counter++;
    }
  }

  reduce<U>(
    reducer: (accumulator: U, value: T, counter: number) => U,
    initialValue: typeof NO_INITIAL_VALUE | U = NO_INITIAL_VALUE
  ): Identity<U> {
    let accumulator = initialValue;
    let counter = 0;
    for (const value of this) {
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
  toArray(): Identity<Array<T>> {
    const result = [];
    for (const x of this) {
      result.push(x);
    }
    return result;
  }
  forEach(fn: (value: T, counter: number) => void): Identity<void> {
    let counter = 0;
    for (const value of this) {
      fn(value, counter);
      counter++;
    }
  }
  some(fn: (value: T, counter: number) => boolean): Identity<boolean> {
    let counter = 0;
    for (const value of this) {
      if (fn(value, counter)) {
        return true;
      }
      counter++;
    }
    return false;
  }
  every(fn: (value: T, counter: number) => boolean): Identity<boolean> {
    let counter = 0;
    for (const value of this) {
      if (!fn(value, counter)) {
        return false;
      }
      counter++;
    }
    return true;
  }
  find(fn: (value: T, counter: number) => boolean): Identity<undefined | T> {
    let counter = 0;
    for (const value of this) {
      if (fn(value, counter)) {
        return value;
      }
      counter++;
    }
    return undefined;
  }
  async * toAsync() {yield* this}
};

globalThis.Iterator = function () {} as unknown as IteratorConstructor;
Object.defineProperty(
  Iterator, 'prototype',
  {
    writable: false,
    enumerable: false,
    configurable: false,
    value: Object.getPrototypeOf(
      // Shared prototype of generators:
      Object.getPrototypeOf(
        (function* () {}).prototype
      )
    ),
  }
);

for (const key of Reflect.ownKeys(Methods.prototype)) {
  const value = (Methods.prototype as Record<string|symbol, any>)[key];
  Object.defineProperty(
    Iterator.prototype, key,
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
  Iterator.prototype, Symbol.toStringTag,
  {
    value: 'Iterator',
    writable: true,
    enumerable: false,
    configurable: true,
  }
);

//========== Static method ==========
// Must be done after Iterator.prototype was set up,
// so that `extends Iterator` works below

class WrappedIterator<T, TReturn = any, TNext = undefined> extends Iterator<T, TReturn, TNext> {
  #iterator;
  constructor(iterator: Iterator<T, TReturn, TNext>) {
    super();
    this.#iterator = iterator;
  }
  override next(...args: [] | [TNext]): Identity<IteratorResult<T, TReturn>> {
    return this.#iterator.next(...args);
  }
  // `async` helps with line (*)
  override return(value?: TReturn | PromiseLike<TReturn>): Identity<IteratorResult<T, TReturn>> {
    const returnMethod = this.#iterator.return;
    if (returnMethod === undefined) {
      return {done: true, value: value as any}; // (*)
    }
    return returnMethod.call(this.#iterator);
  }
}

function Iterator_from<T>(value: any) {
  const iterator = getIterator<Iterator<T>>(value, "sync"); // different quotes for `npm run syncify`
  if (iterator instanceof Iterator) {
    return iterator;
  }
  // `iterator´ does not support the new API – wrap it so that it does
  return new WrappedIterator(iterator);
}

Object.defineProperty(
  Iterator, 'from',
  {
    writable: true,
    enumerable: false,
    configurable: true,
    value: Iterator_from,
  }
);

/*########## END ##########*/ }