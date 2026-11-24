# Select an observing point by coordinates

Choose **Enter coordinates** near the title. The dialog supports keyboard entry,
Enter to submit, Cancel, and Escape. Successful selection uses the same local
calculation, result card, globe pin and Time Jump as clicking Earth.

Enter latitude from **−90 to 90** and longitude from **−180 to 180**, in decimal
degrees. North/east are positive; south/west negative. Zero, poles and both
antimeridian endpoints are valid. Finite decimal scientific notation is also
accepted. Blank values, nonfinite numbers, hexadecimal, direction suffixes and
out-of-range coordinates are rejected rather than coerced or wrapped.

The first invalid field receives focus and a linked error. Invalid submission,
Cancel and Escape leave the selected point/result untouched. Opening again
refreshes the fields from the selected point, including one selected on the
globe; unsaved edits are discarded. A failed calculation keeps the point and
uses the existing retry state. Time Jump return retains the selection/result.

Coordinates remain in browser memory and are not persisted across a document
reload. Entry does not use geocoding or send locations to a service. Calculation
uses the entered numeric precision; the result card still rounds displayed
coordinates to two decimals. Observer elevation keeps the existing zero-metre
default. This change does not alter astronomical algorithms or observer physics.

## Validation boundary

Component tests check signed decimal/boundary input, blank/nonfinite/nondecimal
rejection, focus/errors and cancelled edits. App tests verify existing-result
preservation plus typed-location calculation failure/retry and Time Jump return.
The live globe announcement now derives from selected props rather than a mouse
click's private label, matching the existing selection marker.

jsdom lacks native dialog methods, so unit setup provides only open/close
visibility and notification. Real Chromium checks cover native modal behavior,
background inertness, Escape/focus return, keyboard submission, 360×800 fit and
640×360 scrolling. Browser chrome can receive focus when reverse-tabbing before
the first control; background page controls remain inert. No custom focus trap is
added. Native Safari, assistive-technology and physical soft-keyboard testing
remain unverified. Shared globe code remains eager; no startup-performance claim.
