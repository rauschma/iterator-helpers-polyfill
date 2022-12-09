//========== AsyncFromSyncIterator ==========

class AsyncFromSyncIterator<T, TReturn = any, TNext = undefined> {
  #syncIterator;
  constructor (syncIterator: Iterator<T, TReturn, TNext>) {
    this.#syncIterator = syncIterator;
  }
  async next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>> {
    return this.#syncIterator.next(...args);
  }
  async return(value?: TReturn | PromiseLike<TReturn>): Promise<IteratorResult<T, TReturn>> {
    if (!this.#syncIterator.return) {
      return {done: true, value: value as any};
    }
    if (arguments.length === 0) {
      return this.#syncIterator.return();
    } else {
      return this.#syncIterator.return(value as any);
    }
  }
  async throw(e?: any): Promise<IteratorResult<T, TReturn>> {
    if (!this.#syncIterator.throw) {
      throw e;
    }
    if (arguments.length === 0) {
      return this.#syncIterator.throw();
    } else {
      return this.#syncIterator.throw(e);
    }
  }
}

const AsyncIteratorPrototype = Object.getPrototypeOf(
  Object.getPrototypeOf(
    (async function* () {}).prototype
  )
);
Object.setPrototypeOf(AsyncFromSyncIterator.prototype, AsyncIteratorPrototype)

//========== getIterator ==========

export function getIterator<T>(obj: Record<symbol,any>, hint: 'sync' | 'async'): T {
  if (!isObject(obj)) {
    throw new TypeError();
  }
  let alreadyAsync = false;
  let method = undefined;
  
  if (hint === 'async') {
    method = obj[Symbol.asyncIterator];
    alreadyAsync = true;
  }
  if (typeof method !== 'function') {
    method = obj[Symbol.iterator];
    alreadyAsync = false;
  }
  let iterator = undefined;
  if (typeof method !== 'function') {
    iterator = obj;
    alreadyAsync = true;
  } else {
    iterator = method.call(obj);
  }
  if (!isObject(iterator)) {
    throw new TypeError();
  }
  if (hint === 'async' && !alreadyAsync) {
    return new AsyncFromSyncIterator(iterator) as unknown as T;
  }
  return iterator;
}

//========== Helpers ==========

function isObject(value: unknown) {
  if (value === null) return false;
  const t = typeof value;
  return t === 'object' || t === 'function';
}
