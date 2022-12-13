declare global {

  //SYNC: type __ValueIdentity__<T> = T;

  interface AsyncIterator<T, TReturn = any, TNext = undefined> {
    [Symbol.asyncIterator](): AsyncIterator<T, TReturn, TNext>;

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

    interface AsyncIteratorConstructor {
      new <T, TReturn = any, TNext = undefined>(): AsyncIterator<T, TReturn, TNext>;
      readonly prototype: AsyncIterator<object>;
    }

    var AsyncIterator: AsyncIteratorConstructor;

} // declare global

export {}
