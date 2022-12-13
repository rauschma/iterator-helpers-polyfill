import {installAsyncIteratorPolyfill} from './install-async.js';
import {installIteratorPolyfill} from './install-sync.js';

export * from './install-async.js';
export * from './install-sync.js';

if (!globalThis.AsyncIterator) {
  installAsyncIteratorPolyfill();
}
if (!globalThis.Iterator) {
  installIteratorPolyfill();
}
