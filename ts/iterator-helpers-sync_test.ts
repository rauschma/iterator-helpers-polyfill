import * as assert from 'node:assert/strict';
import test from 'node:test';
import './iterator-helpers.js';

function* createIterator() {
  yield 'a'; yield 'b'; yield 'c'; yield 'd';
}

test('Polyfilling', {only: true}, (t) => {
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
});

test('map', (t) => {
  assert.deepEqual(
    createIterator().map(x => x + x).toArray(),
    ['aa', 'bb', 'cc', 'dd']
  );
});

test('filter', (t) => {
  assert.deepEqual(
    createIterator().filter(x => x <= 'b').toArray(),
    ['a', 'b']
  );
});

test('take', (t) => {
  assert.deepEqual(
    createIterator().take(1).toArray(),
    ['a']
  );
});

test('drop', (t) => {
  assert.deepEqual(
    createIterator().drop(1).toArray(),
    ['b', 'c', 'd']
  );
});

test('flatMap', (t) => {
  assert.deepEqual(
    createIterator()
    .flatMap((x,i) => new Array(i).fill(x))
    .toArray(),
    ['b', 'c', 'c', 'd', 'd', 'd']
  );
});

test('reduce', (t) => {
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
});

test('forEach', (t) => {
  const result: Array<string> = [];
  createIterator().forEach(x => result.push(x));
  assert.deepEqual(
    result,
    ['a', 'b', 'c', 'd']
  );
});

test('some', (t) => {
  assert.deepEqual(
    createIterator().some(x => x === 'c'),
    true
  );
});

test('every', (t) => {
  assert.deepEqual(
    createIterator().every(x => x === 'c'),
    false
  );
});

test('find', (t) => {
  assert.deepEqual(
    createIterator().find((_, i) => i === 1),
    'b'
  );
});
