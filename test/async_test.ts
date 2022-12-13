import * as assert from 'node:assert/strict';
import test from 'node:test';
import '../src/install.js';
import { XAsyncIterator } from '../src/library-async.js';

test('Polyfill', async (t) => {
  /**
   * - Create the iterator in a manner that can be translated to sync.
   * - Note that the result of a generator is an iterable iterator.
   * - In this case, we want to create an iterator and test an iterator-only style.
   */
  async function* createAsyncIterator() {
    yield 'a'; yield 'b'; yield 'c'; yield 'd';
  }

  // Was AsyncIterator created correctly?
  assert.ok(
    AsyncIterator.prototype.isPrototypeOf(createAsyncIterator())
  );
  assert.ok(
    Reflect.ownKeys(AsyncIterator.prototype).includes('take')
  );
  assert.ok(
    Reflect.ownKeys(AsyncIterator.prototype).includes('drop')
  );
  
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

test('Library class', async (t) => {
  /**
   * - Create the iterator in a manner that can be translated to sync.
   * - Note that the result of a generator is an iterable iterator.
   * - In this case, we want to create an iterable and test working with iterables.
   */
  async function* createAsyncIterable() {
    yield 'a'; yield 'b'; yield 'c'; yield 'd';
  }
  
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
