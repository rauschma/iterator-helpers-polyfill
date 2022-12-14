import * as assert from 'node:assert/strict';
import test from 'node:test';
import '../src/install.js';
import { XAsyncIterator } from '../src/library-async.js';
import type { CoreAsyncIterator, CoreIterable } from '../src/util.js';

//SYNC: type __ValueIdentity__<T> = T;

//========== Polyfill ==========

/**
 * - Create the iterator in a manner that can be translated to sync.
 * - Note that the result of a generator is an iterable iterator.
 * - In this case, we want to create an iterator and test an iterator-only style.
 */
async function* createAsyncIterator() {
  yield 'a'; yield 'b'; yield 'c'; yield 'd';
}

test('Polyfill: Was AsyncIterator set up correctly?', (t) => {
  assert.ok(
    AsyncIterator.prototype.isPrototypeOf(createAsyncIterator())
  );
  assert.ok(
    Reflect.ownKeys(AsyncIterator.prototype).includes('take')
  );
  assert.ok(
    Reflect.ownKeys(AsyncIterator.prototype).includes('drop')
  );
});

//----------

test('Polyfill: AsyncIterator.from', async (t) => {
  assert.ok(
    AsyncIterator.from(createAsyncIterator()) instanceof AsyncIterator
  );
  assert.deepEqual(
    await AsyncIterator.from(createAsyncIterator()).toArray(),
    ['a', 'b', 'c', 'd']
  );

  const iterResults: Array<Promise<IteratorResult<string>>> = [
    Promise.resolve({done: false, value: 'x'}),
    Promise.resolve({done: false, value: 'y'}),
    Promise.resolve({done: true, value: undefined}),
  ];
  const obj = {
    count: 0,
    next() {
      return iterResults[this.count++];
    },
  };
  const legacyIterator: CoreAsyncIterator<string> = obj;
  assert.deepEqual(
    await AsyncIterator.from(legacyIterator).toArray(),
    ['x', 'y']
  );
});

//----------

test('Polyfill: prototype methods', async (t) => {
  assert.deepEqual(
    await createAsyncIterator().map(x => x + x).toArray(),
    ['aa', 'bb', 'cc', 'dd']
  );

  assert.deepEqual(
    await createAsyncIterator().filter(x => x <= 'b').toArray(),
    ['a', 'b']
  );

  assert.deepEqual(
    await createAsyncIterator().take(1).toArray(),
    ['a']
  );

  assert.deepEqual(
    await createAsyncIterator().drop(1).toArray(),
    ['b', 'c', 'd']
  );

  assert.deepEqual(
    await createAsyncIterator()
    .flatMap((x,i) => new Array(i).fill(x))
    .toArray(),
    ['b', 'c', 'c', 'd', 'd', 'd']
  );

  assert.deepEqual(
    await createAsyncIterator()
    .reduce((acc, x) => acc + x),
    'abcd'
  );

  assert.deepEqual(
    await createAsyncIterator()
    .reduce((acc, x) => acc + x, '>'),
    '>abcd'
  );

  const result: Array<string> = [];
  await createAsyncIterator().forEach(x => result.push(x));
  assert.deepEqual(
    result,
    ['a', 'b', 'c', 'd']
  );

  assert.deepEqual(
    await createAsyncIterator().some(x => x === 'c'),
    true
  );

  assert.deepEqual(
    await createAsyncIterator().every(x => x === 'c'),
    false
  );

  assert.deepEqual(
    await createAsyncIterator().find((_, i) => i === 1),
    'b'
  );
});

//========== Library ==========

/**
 * - Create the iterable in a manner that can be translated to sync.
 * - Note that the result of a generator is an iterable iterator.
 * - In this case, we want to create an iterable and test working with iterables.
 */
async function* createAsyncIterable() {
  yield 'a'; yield 'b'; yield 'c'; yield 'd';
}

test('Library: XAsyncIterator.from', async (t) => {
  assert.ok(
    XAsyncIterator.from(createAsyncIterator()) instanceof XAsyncIterator
  );
  assert.deepEqual(
    await XAsyncIterator.from(createAsyncIterable()).toArray(),
    ['a', 'b', 'c', 'd']
  );

  const iterResults: Array<Promise<IteratorResult<string>>> = [
    Promise.resolve({done: false, value: 'x'}),
    Promise.resolve({done: false, value: 'y'}),
    Promise.resolve({done: true, value: undefined}),
  ];
  const obj = {
    count: 0,
    next() {
      return iterResults[this.count++];
    },
  };
  const legacyIterator: CoreAsyncIterator<string> = obj;
  assert.deepEqual(
    await XAsyncIterator.from(legacyIterator).toArray(),
    ['x', 'y']
  );
});

//----------

test('Library: prototype methods', async (t) => {
  assert.deepEqual(
    await XAsyncIterator.from(createAsyncIterable()).map(x => x + x).toArray(),
    ['aa', 'bb', 'cc', 'dd']
  );

  assert.deepEqual(
    await XAsyncIterator.from(createAsyncIterable()).filter(x => x <= 'b').toArray(),
    ['a', 'b']
  );

  assert.deepEqual(
    await XAsyncIterator.from(createAsyncIterable()).take(1).toArray(),
    ['a']
  );

  assert.deepEqual(
    await XAsyncIterator.from(createAsyncIterable()).drop(1).toArray(),
    ['b', 'c', 'd']
  );

  assert.deepEqual(
    await XAsyncIterator.from(createAsyncIterable())
    .flatMap((x,i) => new Array(i).fill(x))
    .toArray(),
    ['b', 'c', 'c', 'd', 'd', 'd']
  );

  assert.deepEqual(
    await XAsyncIterator.from(createAsyncIterable())
    .reduce((acc, x) => acc + x),
    'abcd'
  );
  assert.deepEqual(
    await XAsyncIterator.from(createAsyncIterable())
    .reduce((acc, x) => acc + x, '>'),
    '>abcd'
  );

  const result: Array<string> = [];
  await XAsyncIterator.from(createAsyncIterable()).forEach(x => result.push(x));
  assert.deepEqual(
    result,
    ['a', 'b', 'c', 'd']
  );

  assert.deepEqual(
    await XAsyncIterator.from(createAsyncIterable()).some(x => x === 'c'),
    true
  );

  assert.deepEqual(
    await XAsyncIterator.from(createAsyncIterable()).every(x => x === 'c'),
    false
  );

  assert.deepEqual(
    await XAsyncIterator.from(createAsyncIterable()).find((_, i) => i === 1),
    'b'
  );
});
