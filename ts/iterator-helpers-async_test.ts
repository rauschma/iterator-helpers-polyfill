import * as assert from 'node:assert/strict';
import test from 'node:test';
import './iterator-helpers.js';

async function* createIterator() {
  yield 'a'; yield 'b'; yield 'c'; yield 'd';
}

test('Polyfilling', {only: true}, async (t) => {
  // Was AsyncIterator created correctly?
  assert.ok(
    AsyncIterator.prototype.isPrototypeOf(createIterator())
  );
  assert.ok(
    Reflect.ownKeys(AsyncIterator.prototype).includes('take')
  );
  assert.ok(
    Reflect.ownKeys(AsyncIterator.prototype).includes('drop')
  );
});

test('map', async (t) => {
  assert.deepEqual(
    await createIterator().map(x => x + x).toArray(),
    ['aa', 'bb', 'cc', 'dd']
  );
});

test('filter', async (t) => {
  assert.deepEqual(
    await createIterator().filter(x => x <= 'b').toArray(),
    ['a', 'b']
  );
});

test('take', async (t) => {
  assert.deepEqual(
    await createIterator().take(1).toArray(),
    ['a']
  );
});

test('drop', async (t) => {
  assert.deepEqual(
    await createIterator().drop(1).toArray(),
    ['b', 'c', 'd']
  );
});

test('flatMap', async (t) => {
  assert.deepEqual(
    await createIterator()
    .flatMap((x,i) => new Array(i).fill(x))
    .toArray(),
    ['b', 'c', 'c', 'd', 'd', 'd']
  );
});

test('reduce', async (t) => {
  assert.deepEqual(
    await createIterator()
    .reduce((acc, x) => acc + x),
    'abcd'
  );
  assert.deepEqual(
    await createIterator()
    .reduce((acc, x) => acc + x, '>'),
    '>abcd'
  );
});

test('forEach', async (t) => {
  const result: Array<string> = [];
  await createIterator().forEach(x => result.push(x));
  assert.deepEqual(
    result,
    ['a', 'b', 'c', 'd']
  );
});

test('some', async (t) => {
  assert.deepEqual(
    await createIterator().some(x => x === 'c'),
    true
  );
});

test('every', async (t) => {
  assert.deepEqual(
    await createIterator().every(x => x === 'c'),
    false
  );
});

test('find', async (t) => {
  assert.deepEqual(
    await createIterator().find((_, i) => i === 1),
    'b'
  );
});
