import { AbstractIterator, IIterator } from './library-sync.js';
import { GetIteratorFlattenable, LegacyIterable, LegacyIterator, LegacyIterable } from './util.js';

//========== Types ==========

declare global {
  interface Iterator<T, TReturn = any, TNext = undefined> extends IIterator<T, TReturn, TNext> {}

  interface IteratorConstructor {
    from<U>(iterableOrIterator: LegacyIterable<U> | LegacyIterable<U> | LegacyIterator<U>): Iterator<U>;
    new <T, TReturn = any, TNext = undefined>(): Iterator<T, TReturn, TNext>;
    readonly prototype: Iterator<object>;
  }

  var Iterator: IteratorConstructor;
} // declare global

//========== Polyfill ==========

type __ValueIdentity__<T> = T;

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

  for (const key of Reflect.ownKeys(AbstractIterator.prototype)) {
    const value = (AbstractIterator.prototype as Record<string|symbol, any>)[key];
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

} // installIteratorPolyfill