# Eclipse Atlas

An interactive globe that finds the next solar eclipse locally visible from a selected point on Earth. Coordinates and calculations stay in the browser.

## Run locally

```bash
npm install
npm run dev
```

Use the globe to orbit and zoom, then click the visible Earth surface. Eclipse circumstances are computed with Astronomy Engine and presented in the browser's local timezone.

## Earth appearance and attribution

The Earth is rendered with procedural Three.js materials and a geometric latitude/longitude treatment. It intentionally uses no external texture, satellite imagery, or downloaded visual asset, so no third-party image attribution is required.

The visual Earth and any future Sun/Moon layer are illustrative and are not to scale; they never supply the eclipse calculation.

## Checks

```bash
npm run lint
npm run test
npm run build
```
