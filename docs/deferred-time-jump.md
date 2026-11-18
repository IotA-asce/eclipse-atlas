# Deferred observer view

The optional `EclipseTimeJump` component is loaded through a module-scoped React
`lazy` import only when the user chooses **Jump to eclipse**. The globe, calculation
service and result card remain in the initial application. No astronomy, timeline,
vessel, shader, asset or coordinate calculations changed.

`DeferredTimeJump` wraps the view in Suspense and an error boundary. The loading
state announces progress and offers **Back to globe** immediately. A rejected
module or render failure shows an alert with the same return control. App retains
the selected location and eclipse while either state is displayed; returning does
not recalculate the result. This is in-page state, not durable browser storage.
Returning changes the view; a module request already in flight may still finish
and be cached.

React caches the lazy import promise, including rejection. The boundary does not
present a misleading retry button for the same failed promise: returning still
works, while a new page load is needed to reattempt a failed module download.
The boundary also covers observer rendering failures; it does not repair WebGL or
network availability. See the [React lazy reference](https://react.dev/reference/react/lazy).

## Measured production boundary

Measured on 18 November 2026 with the unchanged lockfile, Vite 8.2.1 and
`npm run build -- --manifest`:

| JavaScript | Before | After |
| --- | ---: | ---: |
| Initial static graph, uncompressed bytes | 1,269,964 | 1,177,924 |
| Same graph, gzip bytes (Python gzip, level 9) | 355,997 | 329,708 |
| Separate observer chunk, uncompressed bytes | none | 95,402 |

The initial static graph is 92,040 bytes (7.25%) smaller. The observer code is
deferred, not removed: loading both views transfers slightly more total JavaScript
because the recovery wrapper and chunk boundary add overhead. Shared Three.js and
globe rendering remain eager, and Vite's 500 kB chunk advisory remains. These byte
counts are not a startup-time, frame-rate or total-asset benchmark.

The production manifest marks the observer module as a dynamic entry outside the
entry's recursive static-import graph. Browser checks separately verify that its
request is absent initially, loading can be interrupted with the selected result
retained, failed delivery returns to the result, and the real observer view opens.
The existing real-globe browser workflow remains unchanged. The portfolio receipt
retains build manifests, browser observations and actual validation results.

## Reproduce

Run unit tests, lint, build and the existing e2e workflow listed in the README.
For production inspection, build with `--manifest`, then use `npm run preview` on
a loopback address. Start with a fresh document to avoid a previously resolved
lazy module. Inspect requests before clicking Jump, then delay or fail only the
`EclipseTimeJump-*.js` request to exercise loading and recovery. Restore routing
and reload before checking a successful download. Do not weaken or hide the
remaining main-chunk size warning to make this change look like a complete
startup-performance solution.
