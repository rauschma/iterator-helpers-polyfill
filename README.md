# Iterator helpers polyfill

## Warning

**Don’t trust this code:**

* It’s mostly untested.
* I cut corners to make the TypeScript types work.

Caveats:

* The focus is on simple code, not on spec compliance.
* I use textual search-and-replace to convert the asynchronous code to synchronous code.
  * Performed via: `npm run syncify`

Functionality:

* This polyfill implements all constructs specified in the proposal.
* This polyfill deliberately does not provide any additional functionality.

## Installation

```js
npm install @rauschma/iterator-helpers-polyfill
```

## Examples

### Polyfill

```js
import assert from 'node:assert/strict';
import '@rauschma/iterator-helpers-polyfill/install'; // install polyfill globally

assert.deepEqual(
  new Set(['a', 'b', 'c']).values()
  .map(x => x + x).toArray(),
  ['aa', 'bb', 'cc']
);

assert.deepEqual(
  new Set(['a', 'b', 'c']).values()
  .filter(x => x <= 'b').toArray(),
  ['a', 'b']
);

assert.deepEqual(
  new Set(['a', 'b', 'c']).values()
  .take(1).toArray(),
  ['a']
);
```

### Library (doesn’t change JavaScript’s globals)

```js
import assert from 'node:assert/strict';
import {XIterator} from '@rauschma/iterator-helpers-polyfill';

assert.deepEqual(
  XIterator.from(new Set(['a', 'b', 'c']))
  .map(x => x + x).toArray(),
  ['aa', 'bb', 'cc']
);

assert.deepEqual(
  XIterator.from(new Set(['a', 'b', 'c']))
  .filter(x => x <= 'b').toArray(),
  ['a', 'b']
);

assert.deepEqual(
  XIterator.from(new Set(['a', 'b', 'c']))
  .take(1).toArray(),
  ['a']
);
```

### More examples

* [`test/sync_test.ts`](https://github.com/rauschma/iterator-helpers-polyfill/blob/main/test/sync_test.ts)
* [`test/async_test.ts`](https://github.com/rauschma/iterator-helpers-polyfill/blob/main/test/async_test.ts)
* [`test/misc_test.ts`](https://github.com/rauschma/iterator-helpers-polyfill/blob/main/test/misc_test.ts)

## Material on iterator helpers

* ECMAScript proposal: https://github.com/tc39/proposal-iterator-helpers
* Blog post: https://2ality.com/2022/12/iterator-helpers.html
