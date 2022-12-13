import * as assert from 'node:assert/strict';
import test from 'node:test';
import '../src/install.js';
import { XAsyncIterator } from '../src/library-async.js';

async function* createAsyncIterator() {
  yield 'a'; yield 'b'; yield 'c'; yield 'd';
}

test('Polyfill', async (t) => {
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
  function createXAsyncIterator() {
    return XAsyncIterator.from(createAsyncIterator());
  }
  
  assert.deepEqual(
    await createXAsyncIterator().map(x => x + x).toArray(),
    ['aa', 'bb', 'cc', 'dd']
  );

  assert.deepEqual(
    await createXAsyncIterator().filter(x => x <= 'b').toArray(),
    ['a', 'b']
  );

  assert.deepEqual(
    await createXAsyncIterator().take(1).toArray(),
    ['a']
  );

  assert.deepEqual(
    await createXAsyncIterator().drop(1).toArray(),
    ['b', 'c', 'd']
  );

  assert.deepEqual(
    await createXAsyncIterator()
    .flatMap((x,i) => new Array(i).fill(x))
    .toArray(),
    ['b', 'c', 'c', 'd', 'd', 'd']
  );

  assert.deepEqual(
    await createXAsyncIterator()
    .reduce((acc, x) => acc + x),
    'abcd'
  );
  assert.deepEqual(
    await createXAsyncIterator()
    .reduce((acc, x) => acc + x, '>'),
    '>abcd'
  );

  const result: Array<string> = [];
  await createXAsyncIterator().forEach(x => result.push(x));
  assert.deepEqual(
    result,
    ['a', 'b', 'c', 'd']
  );

  assert.deepEqual(
    await createXAsyncIterator().some(x => x === 'c'),
    true
  );

  assert.deepEqual(
    await createXAsyncIterator().every(x => x === 'c'),
    false
  );

  assert.deepEqual(
    await createXAsyncIterator().find((_, i) => i === 1),
    'b'
  );
});
