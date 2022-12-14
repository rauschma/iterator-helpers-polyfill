// Test functionality that doesn’t exist in both async and sync versions

import * as assert from 'node:assert/strict';
import test from 'node:test';
import '../src/install.js';
import { XAsyncIterator } from '../src/library-async.js';
import { XIterator } from '../src/library-sync.js';

//========== Polyfill ==========

test('Polyfill: AsyncIterator.from(syncIterable)', async (t) => {
  const syncIterable = ['x', 'y']
  assert.deepEqual(
    await AsyncIterator.from(syncIterable).toArray(),
    ['x', 'y']
  );
});

test('Polyfill: toAsync', (t) => {
  assert.ok(
    ['a', 'b', 'c'].values().toAsync() instanceof AsyncIterator
  );
});

test('Polyfill: flatMap', async (t) => {
  assert.deepEqual(
    await createAsyncIterator()
    .flatMap(x => createAsyncIterator()).toArray(),
    ['a','b','c', 'a','b','c', 'a','b','c']
  );
});

//========== Library ==========

test('Library: XAsyncIterator.from(syncIterable)', async (t) => {
  const syncIterable = ['x', 'y'];
  assert.deepEqual(
    await XAsyncIterator.from(syncIterable).toArray(),
    ['x', 'y']
  );
});

test('Library: toAsync', (t) => {
  assert.ok(
    XIterator.from(['a', 'b', 'c']).toAsync() instanceof XAsyncIterator
  );
});

test('Polyfill: flatMap', async (t) => {
  assert.deepEqual(
    await XAsyncIterator.from(createAsyncIterator())
    .flatMap(x => createAsyncIterator()).toArray(),
    ['a','b','c', 'a','b','c', 'a','b','c']
  );
});

//========== Helpers ==========

async function* createAsyncIterator() {
  yield 'a'; yield 'b'; yield 'c';
}
