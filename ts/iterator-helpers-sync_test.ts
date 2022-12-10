import * as assert from 'node:assert/strict';
import test from 'node:test';
import './install-polyfill.js';
import { XIterator } from './iterator-helpers-sync.js';

test('Polyfill', (t) => {
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
  function createXIterator() {
    function* gen() {
      yield 'a'; yield 'b'; yield 'c'; yield 'd';
    }
    return XIterator.from(gen());
  }
  
  assert.deepEqual(
    createXIterator().map(x => x + x).toArray(),
    ['aa', 'bb', 'cc', 'dd']
  );

  assert.deepEqual(
    createXIterator().filter(x => x <= 'b').toArray(),
    ['a', 'b']
  );

  assert.deepEqual(
    createXIterator().take(1).toArray(),
    ['a']
  );

  assert.deepEqual(
    createXIterator().drop(1).toArray(),
    ['b', 'c', 'd']
  );

  assert.deepEqual(
    createXIterator()
    .flatMap((x,i) => new Array(i).fill(x))
    .toArray(),
    ['b', 'c', 'c', 'd', 'd', 'd']
  );

  assert.deepEqual(
    createXIterator()
    .reduce((acc, x) => acc + x),
    'abcd'
  );
  assert.deepEqual(
    createXIterator()
    .reduce((acc, x) => acc + x, '>'),
    '>abcd'
  );

  const result: Array<string> = [];
  createXIterator().forEach(x => result.push(x));
  assert.deepEqual(
    result,
    ['a', 'b', 'c', 'd']
  );

  assert.deepEqual(
    createXIterator().some(x => x === 'c'),
    true
  );

  assert.deepEqual(
    createXIterator().every(x => x === 'c'),
    false
  );

  assert.deepEqual(
    createXIterator().find((_, i) => i === 1),
    'b'
  );
});
