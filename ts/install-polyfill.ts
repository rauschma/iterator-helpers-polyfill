import {installAsyncIteratorPolyfill} from './iterator-helpers-async.js';
import {installIteratorPolyfill} from './iterator-helpers-sync.js';

if (!globalThis.AsyncIterator) {
  installAsyncIteratorPolyfill();
}
if (!globalThis.Iterator) {
  installIteratorPolyfill();
}
