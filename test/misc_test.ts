// Test functionality that doesn’t exist in both async and sync versions

import * as assert from 'node:assert/strict';
import test from 'node:test';
import '../src/install.js';
import { XAsyncIterator } from '../src/library-async.js';
import { XIterator } from '../src/library-sync.js';

test('toAsync (polyfill)', async (t) => {
  assert.ok(
    ['a', 'b', 'c'].values().toAsync() instanceof AsyncIterator
  );
});

test('toAsync (library)', async (t) => {
  assert.ok(
    XIterator.from(['a', 'b', 'c']).toAsync() instanceof XAsyncIterator
  );
});
