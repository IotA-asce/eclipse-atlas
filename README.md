# Eclipse Atlas

An interactive globe that finds the next solar eclipse locally visible from a selected point on Earth. Coordinates and calculations stay in the browser.

## Run locally

```bash
npm install
npm run dev
```

Use the globe to orbit and zoom, then click the visible Earth surface. Eclipse circumstances are computed with Astronomy Engine and presented in the browser's local timezone.

## Earth appearance and attribution

The globe uses NASA's **Blue Marble — A Seamless Image Mosaic of the Earth** (2048 × 1024), an equirectangular Earth image from NASA Goddard Space Flight Center's Scientific Visualization Studio. It is included locally at `public/textures/earth-blue-marble-2048.png`, rendered as an sRGB Three.js texture, and horizontally aligned so its geographic longitudes match the selected-point calculation convention.

- Source: [NASA SVS, Blue Marble — A Seamless Image Mosaic of the Earth](https://svs.gsfc.nasa.gov/2915/)
- Usage: NASA imagery is generally not subject to U.S. copyright; this project includes no NASA insignia or endorsement. See [NASA media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).

The Sun/Moon scene is illustrative and deliberately not to scale. It never supplies the eclipse calculation.

If the map texture cannot load, Eclipse Atlas retains a high-contrast fallback globe and location selection remains available. Calculation errors preserve the selected point and offer an in-place retry.

## Checks

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```
