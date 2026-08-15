# Eclipse Atlas

An interactive globe that finds the next solar eclipse locally visible from a selected point on Earth. Coordinates and calculations stay in the browser.

## Run locally

```bash
npm install
npm run dev
```

Use the globe to orbit and zoom, then click the visible Earth surface. Eclipse circumstances are computed with Astronomy Engine and presented in the browser's local timezone.

## Earth appearance and attribution

The globe uses NASA's **Blue Marble Next Generation — August 2004 with topography** (5400 × 2700), an equirectangular Earth image from NASA Goddard Space Flight Center's Scientific Visualization Studio. It is included locally at `public/textures/earth-blue-marble-5400.png`, rendered as an sRGB Three.js texture without horizontal mirroring, so the map's prime meridian and east-positive longitudes match the selected-point calculation convention.

- Source: [NASA SVS, Blue Marble Next Generation frames](https://svs.gsfc.nasa.gov/12564/), specifically `world.topo.2004-08.png`
- Usage: NASA imagery is generally not subject to U.S. copyright; this project includes no NASA insignia or endorsement. See [NASA media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).

Country boundaries use the locally bundled [Natural Earth 1:110m Admin 0 boundary lines](https://www.naturalearthdata.com/), which Natural Earth distributes in the public domain. The restrained city points are a small, app-maintained list of major world cities; both layers are bundled with the application and do not fetch geographic data from third parties at runtime.

The cloud layer is a locally computed, deterministic atmosphere simulation, not an image and not a live or historical weather-data layer. A low-resolution latitude/longitude field evolves humidity, temperature, and cloud water: latitude wind bands and seeded cyclonic disturbances advect it; saturation causes condensation; neighbouring cells diffuse it; and warm, dry air dissipates it. The updated RGBA field is uploaded to a Three.js texture on capped animation ticks and rendered on two non-interactive shells above Earth. It is designed to behave credibly—accumulating, drifting, shearing, and fading—without claiming meteorological accuracy or a forecast.

The full-page scene uses one rendered Sun light source for Earth and Moon illumination. The Moon uses NASA SVS's 2025 LROC global color mosaic (2K), assembled from Lunar Reconnaissance Orbiter camera data; it is an equirectangular surface map centered at 0° longitude. Credit: NASA Scientific Visualization Studio / LRO camera teams. Source: [NASA SVS CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/).

The night sky uses 8,920 locally bundled HYG v4.1 stars to apparent magnitude 6.5, with J2000 right ascension/declination values. Astronomy Engine projects those stars above the selected observer's horizon at the current time and refreshes every minute. HYG combines Hipparcos, Yale Bright Star, and Gliese catalog data; source: [Astronexus HYG Database](https://github.com/astronexus/hyg-database). The Sun/Moon scene remains deliberately non-scale and never supplies the eclipse calculation.

If the map texture cannot load, Eclipse Atlas retains a high-contrast fallback globe and location selection remains available. Calculation errors preserve the selected point and offer an in-place retry.

## Checks

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```
