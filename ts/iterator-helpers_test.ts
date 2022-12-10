// Test functionality that doesn’t exist in both async and sync versions

import * as assert from 'node:assert/strict';
import test from 'node:test';
import './install-polyfill.js';

function* createIterable() {
  yield 'a'; yield 'b'; yield 'c'; yield 'd';
}

test('toAsync', async (t) => {
  assert.ok(
    createIterable().toAsync() instanceof AsyncIterator
  );
});
