/// <reference path="./iterator-helpers-async-types.d.ts" />
/// <reference path="./iterator-helpers-sync-types.d.ts" />

import {installAsyncIteratorPolyfill} from './iterator-helpers-async.js';
import {installIteratorPolyfill} from './iterator-helpers-sync.js';

if (!globalThis.AsyncIterator) {
  installAsyncIteratorPolyfill();
}
if (!globalThis.Iterator) {
  installIteratorPolyfill();
}
