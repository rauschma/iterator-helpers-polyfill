import * as util from './util.js';
import { XAsyncIterator } from './library-async.js';

//========== Types ==========

type __ValueIdentity__<T> = T;

export interface IIterator<T, TReturn = any, TNext = undefined> {
  [Symbol.iterator](): Iterator<T, TReturn, TNext>;
  next(...args: [] | [TNext]): __ValueIdentity__<IteratorResult<T, TReturn>>;

  map<U>(mapper: (value: T, counter: number) => U): Iterator<U>;
  filter(filterer: (value: T, counter: number) => boolean): Iterator<T>;
  take(limit: number): Iterator<T>;
  drop(limit: number): Iterator<T>;
  flatMap<U>(mapper: (value: T, counter: number) => Iterable<U>): Iterator<U>;
  reduce<U>(
    reducer: (accumulator: U, value: T, counter: number) => U,
    initialValue?: U
  ): __ValueIdentity__<U>;
  toArray(): __ValueIdentity__<Array<T>>;
  forEach(fn: (value: T, counter: number) => void): __ValueIdentity__<void>;
  some(fn: (value: T, counter: number) => boolean): __ValueIdentity__<boolean>;
  every(fn: (value: T, counter: number) => boolean): __ValueIdentity__<boolean>;
  find(fn: (value: T, counter: number) => boolean): __ValueIdentity__<undefined | T>;
  toAsync(): AsyncIterator<T>;
}

//========== Prototype methods ==========

const NO_INITIAL_VALUE = Symbol('NO_INITIAL_VALUE');

/**
 * The return type `Iterator<U>` is good enough in “polyfill mode”.
 * In “library mode”, these methods are wrapped anyway.
 */
export abstract class AbstractIterator<T, TReturn = any, TNext = undefined> implements IIterator<T, TReturn, TNext> {
  abstract [Symbol.iterator](): Iterator<T, TReturn, TNext>;
  abstract next(...args: [] | [TNext]): __ValueIdentity__<IteratorResult<T, TReturn>>;

  * map<U>(mapper: (value: T, counter: number) => U): Iterator<U> {
    let counter = 0;
    for (const value of this as unknown as Iterable<T>) {
      yield mapper(value, counter);
      counter++;
    }
  }

  * filter(filterer: (value: T, counter: number) => boolean): Iterator<T> {
    let counter = 0;
    for (const value of this as unknown as Iterable<T>) {
      if (filterer(value, counter)) {
        yield value;
      }
      counter++;
    }
  }

  * take(limit: number): Iterator<T> {
    let counter = 0;
    for (const value of this as unknown as Iterable<T>) {
      if (counter >= limit) break;
      yield value;
      counter++;
    }
  }

  * drop(limit: number): Iterator<T> {
    let counter = 0;
    for (const value of this as unknown as Iterable<T>) {
      if (counter >= limit) {
        yield value;
      }
      counter++;
    }
  }

  * flatMap<U>(mapper: (value: T, counter: number) => Iterable<U>): Iterator<U> {
    let counter = 0;
    for (const value of this as unknown as Iterable<T>) {
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
    for (const value of this as unknown as Iterable<T>) {
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
    for (const x of this as unknown as Iterable<T>) {
      result.push(x);
    }
    return result;
  }
  forEach(fn: (value: T, counter: number) => void): __ValueIdentity__<void> {
    let counter = 0;
    for (const value of this as unknown as Iterable<T>) {
      fn(value, counter);
      counter++;
    }
  }
  some(fn: (value: T, counter: number) => boolean): __ValueIdentity__<boolean> {
    let counter = 0;
    for (const value of this as unknown as Iterable<T>) {
      if (fn(value, counter)) {
        return true;
      }
      counter++;
    }
    return false;
  }
  every(fn: (value: T, counter: number) => boolean): __ValueIdentity__<boolean> {
    let counter = 0;
    for (const value of this as unknown as Iterable<T>) {
      if (!fn(value, counter)) {
        return false;
      }
      counter++;
    }
    return true;
  }
  find(fn: (value: T, counter: number) => boolean): __ValueIdentity__<undefined | T> {
    let counter = 0;
    for (const value of this as unknown as Iterable<T>) {
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

export class XIterator<T> extends AbstractIterator<T> {
  static from<U>(iterableOrIterator: util.CoreIterable<U> | util.CoreIterable<U> | util.CoreIterator<U>): XIterator<U> {
    const iterator = util.GetIteratorFlattenable<Iterator<U>>(iterableOrIterator as unknown as Record<symbol,any>, "sync"); // different quotes for `npm run syncify`
    if (iterator instanceof XIterator) {
      return iterator;
    }
    return new XIterator( iterator );
  }

  #iterator;

  private constructor(iterator: util.CoreIterator<T>) {
    super();
    this.#iterator = iterator;
  }

  //----- Implemented abstract methods -----

  next(): __ValueIdentity__<IteratorResult<T>> {
    return this.#iterator.next();
  }
  [Symbol.iterator](): XIterator<T> {
    return this;
  }

  //----- Overidden methods -----

  override map<U>(mapper: (value: T, counter: number) => U): XIterator<U> {
    return XIterator.from(super.map(mapper));
  }

  override filter(filterer: (value: T, counter: number) => boolean): XIterator<T> {
    return XIterator.from(super.filter(filterer));
  }

  override take(limit: number): XIterator<T> {
    return XIterator.from(super.take(limit));
  }

  override drop(limit: number): XIterator<T> {
    return XIterator.from(super.drop(limit));
  }

  override flatMap<U>(mapper: (value: T, counter: number) => Iterable<U>): XIterator<U> {
    return XIterator.from(super.flatMap(mapper));
  }

  override toAsync(): XAsyncIterator<T> {return XAsyncIterator.from(super.toAsync())}
}
