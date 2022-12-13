// Test functionality that doesn’t exist in both async and sync versions

import * as assert from 'node:assert/strict';
import test from 'node:test';
import '../src/install.js';
import { XAsyncIterator } from '../src/library-async.js';
import { XIterator } from '../src/library-sync.js';

//========== Sync ==========

test('Polyfill: toAsync', (t) => {
  assert.ok(
    ['a', 'b', 'c'].values().toAsync() instanceof AsyncIterator
  );
});

test('Library: toAsync', (t) => {
  assert.ok(
    XIterator.from(['a', 'b', 'c']).toAsync() instanceof XAsyncIterator
  );
});

//========== Async ==========

test('Polyfill: AsyncIterator.from(syncIterable)', async (t) => {
  const syncIterable = ['x', 'y']
  assert.deepEqual(
    await AsyncIterator.from(syncIterable).toArray(),
    ['x', 'y']
  );
});

test('Library: XAsyncIterator.from(syncIterable)', async (t) => {
  const syncIterable = ['x', 'y'];
  assert.deepEqual(
    await XAsyncIterator.from(syncIterable).toArray(),
    ['x', 'y']
  );
});
