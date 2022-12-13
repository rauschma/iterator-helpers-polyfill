import { getIterator, GetIteratorFlattenable } from './iterator-utils.js';

//========== Prototype methods ==========

const NO_INITIAL_VALUE = Symbol('NO_INITIAL_VALUE');

abstract class Methods<T, TReturn = any, TNext = undefined> implements Iterator<T, TReturn, TNext> {
  abstract next(...args: [] | [TNext]): __ValueIdentity__<IteratorResult<T, TReturn>>;
  abstract [Symbol.iterator](): Iterator<T, TReturn, TNext>;

  * map<U>(mapper: (value: T, counter: number) => U): Iterator<U> {
    let counter = 0;
    for (const value of this as Iterable<T>) {
      yield mapper(value, counter);
      counter++;
    }
  }

  * filter(filterer: (value: T, counter: number) => boolean): Iterator<T> {
    let counter = 0;
    for (const value of this as Iterable<T>) {
      if (filterer(value, counter)) {
        yield value;
      }
      counter++;
    }
  }

  * take(limit: number): Iterator<T> {
    let counter = 0;
    for (const value of this as Iterable<T>) {
      if (counter >= limit) break;
      yield value;
      counter++;
    }
  }

  * drop(limit: number): Iterator<T> {
    let counter = 0;
    for (const value of this as Iterable<T>) {
      if (counter >= limit) {
        yield value;
      }
      counter++;
    }
  }

  * flatMap<U>(mapper: (value: T, counter: number) => Iterable<U>): Iterator<U> {
    let counter = 0;
    for (const value of this as Iterable<T>) {
      yield* mapper(value, counter);
      counter++;
    }
  }

  reduce<U>(
    reducer: (accumulator: U, value: T, counter: number) => U,
    initialValue: typeof NO_INITIAL_VALUE | U = NO_INITIAL_VALUE
  ): __ValueIdentity__<U> {
    let accumulator = initialValue;
    let counter = 0;
    for (const value of this as Iterable<T>) {
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
  toArray(): __ValueIdentity__<Array<T>> {
    const result = [];
    for (const x of this as Iterable<T>) {
      result.push(x);
    }
    return result;
  }
  forEach(fn: (value: T, counter: number) => void): __ValueIdentity__<void> {
    let counter = 0;
    for (const value of this as Iterable<T>) {
      fn(value, counter);
      counter++;
    }
  }
  some(fn: (value: T, counter: number) => boolean): __ValueIdentity__<boolean> {
    let counter = 0;
    for (const value of this as Iterable<T>) {
      if (fn(value, counter)) {
        return true;
      }
      counter++;
    }
    return false;
  }
  every(fn: (value: T, counter: number) => boolean): __ValueIdentity__<boolean> {
    let counter = 0;
    for (const value of this as Iterable<T>) {
      if (!fn(value, counter)) {
        return false;
      }
      counter++;
    }
    return true;
  }
  find(fn: (value: T, counter: number) => boolean): __ValueIdentity__<undefined | T> {
    let counter = 0;
    for (const value of this as Iterable<T>) {
      if (fn(value, counter)) {
        return value;
      }
      counter++;
    }
    return undefined;
  }
  async * toAsync(): AsyncIterator<T> {yield* this as any}
};

//========== Library class ==========

export class XIterator<T> extends Methods<T> {
  static from<U>(iterableOrIterator: Iterable<U> | Iterator<U>): XIterator<U> {
    return new XIterator(
      getIterator(iterableOrIterator)
    );
  }

  #iterator;

  private constructor(iterator: Iterator<T>) {
    super();
    this.#iterator = iterator;
  }

  //----- Implemented abstract methods -----

  next(): __ValueIdentity__<IteratorResult<T>> {
    return this.#iterator.next();
  }
  [Symbol.iterator](): Iterator<T> {
    return this;
  }

  //----- Overidden methods -----

  override map<U>(mapper: (value: T, counter: number) => U): Iterator<U> {
    return XIterator.from(super.map(mapper));
  }

  override filter(filterer: (value: T, counter: number) => boolean): Iterator<T> {
    return XIterator.from(super.filter(filterer));
  }

  override take(limit: number): Iterator<T> {
    return XIterator.from(super.take(limit));
  }

  override drop(limit: number): Iterator<T> {
    return XIterator.from(super.drop(limit));
  }

  override flatMap<U>(mapper: (value: T, counter: number) => Iterable<U>): Iterator<U> {
    return XIterator.from(super.flatMap(mapper));
  }
}

//========== Polyfill ==========

export function installIteratorPolyfill() {

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

  //----- Prototype properties -----

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

  //----- Static method -----
  // Must be done after Iterator.prototype was set up,
  // so that `extends Iterator` works below

  class WrappedIterator<T, TReturn = any, TNext = undefined> extends Iterator<T, TReturn, TNext> {
    #iterator;
    constructor(iterator: Iterator<T, TReturn, TNext>) {
      super();
      this.#iterator = iterator;
    }
    override next(...args: [] | [TNext]): __ValueIdentity__<IteratorResult<T, TReturn>> {
      return this.#iterator.next(...args);
    }
    // `async` helps with line (*)
    override return(value?: TReturn | PromiseLike<TReturn>): __ValueIdentity__<IteratorResult<T, TReturn>> {
      const returnMethod = this.#iterator.return;
      if (returnMethod === undefined) {
        return {done: true, value: value as any}; // (*)
      }
      return returnMethod.call(this.#iterator);
    }
  }

  function Iterator_from<T>(value: any) {
    const iterator = GetIteratorFlattenable<Iterator<T>>(value, "sync"); // different quotes for `npm run syncify`
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

} // installPolyfill