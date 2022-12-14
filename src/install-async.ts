import { AbstractAsyncIterator, IAsyncIterator } from './library-async.js';
import * as util from './util.js';

//========== Types ==========

declare global {
  interface AsyncIterator<T, TReturn = any, TNext = undefined> extends IAsyncIterator<T, TReturn, TNext> {}

  interface AsyncIteratorConstructor {
    from<U>(iterableOrIterator: util.CoreIterable<U> | util.CoreAsyncIterable<U> | util.CoreAsyncIterator<U>): AsyncIterator<U>;
    new <T, TReturn = any, TNext = undefined>(): AsyncIterator<T, TReturn, TNext>;
    readonly prototype: AsyncIterator<object>;
  }

  var AsyncIterator: AsyncIteratorConstructor;
} // declare global

//========== Polyfill ==========

//SYNC: type __ValueIdentity__<T> = T;

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

  for (const key of Reflect.ownKeys(AbstractAsyncIterator.prototype)) {
    const value = (AbstractAsyncIterator.prototype as Record<string|symbol, any>)[key];
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
    const iterator = util.GetIteratorFlattenable<AsyncIterator<T>>(value, "async"); // different quotes for `npm run syncify`
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

} // installAsyncIteratorPolyfill