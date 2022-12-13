import * as assert from 'node:assert/strict';
import test from 'node:test';
import '../src/install.js';
import { XIterator } from '../src/library-sync.js';

test('Polyfill', (t) => {
  /**
   * - Create the iterator in a manner that can be translated to sync.
   * - Note that the result of a generator is an iterable iterator.
   * - In this case, we want to create an iterator and test an iterator-only style.
   */
  function* createIterator() {
    yield 'a'; yield 'b'; yield 'c'; yield 'd';
  }

  // Was Iterator created correctly?
  assert.ok(
    Iterator.prototype.isPrototypeOf(createIterator())
  );
  assert.ok(
    Reflect.ownKeys(Iterator.prototype).includes('take')
  );
  assert.ok(
    Reflect.ownKeys(Iterator.prototype).includes('drop')
  );
  
  assert.deepEqual(
    createIterator().map(x => x + x).toArray(),
    ['aa', 'bb', 'cc', 'dd']
  );

  assert.deepEqual(
    createIterator().filter(x => x <= 'b').toArray(),
    ['a', 'b']
  );

  assert.deepEqual(
    createIterator().take(1).toArray(),
    ['a']
  );

  assert.deepEqual(
    createIterator().drop(1).toArray(),
    ['b', 'c', 'd']
  );

  assert.deepEqual(
    createIterator()
    .flatMap((x,i) => new Array(i).fill(x))
    .toArray(),
    ['b', 'c', 'c', 'd', 'd', 'd']
  );

  assert.deepEqual(
    createIterator()
    .reduce((acc, x) => acc + x),
    'abcd'
  );
  assert.deepEqual(
    createIterator()
    .reduce((acc, x) => acc + x, '>'),
    '>abcd'
  );

  const result: Array<string> = [];
  createIterator().forEach(x => result.push(x));
  assert.deepEqual(
    result,
    ['a', 'b', 'c', 'd']
  );

  assert.deepEqual(
    createIterator().some(x => x === 'c'),
    true
  );

  assert.deepEqual(
    createIterator().every(x => x === 'c'),
    false
  );

  assert.deepEqual(
    createIterator().find((_, i) => i === 1),
    'b'
  );
});

test('Library class', (t) => {
  /**
   * - Create the iterator in a manner that can be translated to sync.
   * - Note that the result of a generator is an iterable iterator.
   * - In this case, we want to create an iterable and test working with iterables.
   */
  function* createAsyncIterable() {
    yield 'a'; yield 'b'; yield 'c'; yield 'd';
  }
  
  assert.deepEqual(
    XIterator.from(createAsyncIterable()).map(x => x + x).toArray(),
    ['aa', 'bb', 'cc', 'dd']
  );

  assert.deepEqual(
    XIterator.from(createAsyncIterable()).filter(x => x <= 'b').toArray(),
    ['a', 'b']
  );

  assert.deepEqual(
    XIterator.from(createAsyncIterable()).take(1).toArray(),
    ['a']
  );

  assert.deepEqual(
    XIterator.from(createAsyncIterable()).drop(1).toArray(),
    ['b', 'c', 'd']
  );

  assert.deepEqual(
    XIterator.from(createAsyncIterable())
    .flatMap((x,i) => new Array(i).fill(x))
    .toArray(),
    ['b', 'c', 'c', 'd', 'd', 'd']
  );

  assert.deepEqual(
    XIterator.from(createAsyncIterable())
    .reduce((acc, x) => acc + x),
    'abcd'
  );
  assert.deepEqual(
    XIterator.from(createAsyncIterable())
    .reduce((acc, x) => acc + x, '>'),
    '>abcd'
  );

  const result: Array<string> = [];
  XIterator.from(createAsyncIterable()).forEach(x => result.push(x));
  assert.deepEqual(
    result,
    ['a', 'b', 'c', 'd']
  );

  assert.deepEqual(
    XIterator.from(createAsyncIterable()).some(x => x === 'c'),
    true
  );

  assert.deepEqual(
    XIterator.from(createAsyncIterable()).every(x => x === 'c'),
    false
  );

  assert.deepEqual(
    XIterator.from(createAsyncIterable()).find((_, i) => i === 1),
    'b'
  );
});
