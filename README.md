# Iterator helpers polyfill

## Warning

**Don’t trust this code:**

* It’s mostly untested.
* I cut corners to make the TypeScript types work.

Caveats:

* The focus is on simple code, not on spec compliance.
* I use textual search-and-replace to convert the asynchronous code to synchronous code.
  * Performed via: `npm run syncify`
* The only way to use this polyfill is by installing it into JavaScript’s global variables.

Functionality:

* This polyfill implements all constructs specified in the proposal.
* This polyfill deliberately does not provide any additional functionality.

## Installation

```js
npm install @rauschma/iterator-helpers-polyfill
```

## Examples

```js
import '@rauschma/iterator-helpers-polyfill/install'; // install polyfill globally

function* createIterator() {
  yield 'a'; yield 'b'; yield 'c'; yield 'd';
}

assert.deepEqual(
  createIterator().map(x => x + x).toArray(),
  ['aa', 'bb', 'cc', 'dd']
);

assert.deepEqual(
  createIterator().filter(x => x <= 'b').toArray(),
  ['a', 'b']
);

assert.deepEqual(
  createIterator().take(1).toArray(),
  ['a']
);
```

More examples:

* [`ts/iterator-helpers-sync_test.ts`](https://github.com/rauschma/iterator-helpers-polyfill/blob/main/ts/iterator-helpers-sync_test.ts)
* [`ts/iterator-helpers-async_test.ts`](https://github.com/rauschma/iterator-helpers-polyfill/blob/main/ts/iterator-helpers-async_test.ts)

## Material on iterator helpers

* ECMAScript proposal: https://github.com/tc39/proposal-iterator-helpers
* Blog post: https://2ality.com/2022/12/iterator-helpers.html
