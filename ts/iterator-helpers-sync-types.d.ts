declare global {

  type __ValueIdentity__<T> = T;

  interface Iterator<T, TReturn = any, TNext = undefined> {
    [Symbol.iterator](): Iterator<T, TReturn, TNext>;

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

  interface IteratorConstructor {
    new <T, TReturn = any, TNext = undefined>(): Iterator<T, TReturn, TNext>;
    readonly prototype: Iterator<object>;
  }

  var Iterator: IteratorConstructor;

} // declare global

export {}
