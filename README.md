# tiny-set-immediate

A minimal polyfill of setImmediate, for modern browsers using `window.postMessage`, and `MessageChannel` in workers.

If the native functions are available they will be returned instead of a polyfill.

```ts
import { setImmediate, clearImmediate } from 'tiny-set-immediate';

const handle = setImmediate(
  (...args) => {
    console.log(args);
  },
  [1, 2],
);

clearImmediate(handle);
```

This implementation does not allow string callbacks, and will not eval it.
