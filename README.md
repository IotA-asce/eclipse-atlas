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

## Eclipse Time Jump

After a result is calculated, **Jump to eclipse** opens an observer-mode scene at the selected coordinates. It starts exactly two minutes before the computed partial-phase contact and advances at 1× real time by default; 30× and 300× are explicit opt-in controls for viewing a long event faster. The Sun and Moon use Astronomy Engine's topocentric coordinates at the simulated time, while the displayed coverage follows the calculated local circumstances. A locally bundled Natural Earth 1:110m land polygon determines whether the deliberately stylized observer environment is roadside/car-side or ship-deck. It is a cinematic local visualization, not a reconstruction of the exact road, terrain, vessel, weather, or horizon at that coordinate.

Click the observer view to activate mouse-look; use **W/A/S/D** to move around it. Land scenes derive broad local relief from the locally bundled, public-domain **NASA/ASTER GDEM** global 3600 × 1800 elevation map. Ocean observers begin on the selected vessel's deck: the camera follows its heave/roll/pitch and is confined by explicit rail and superstructure collision volumes. This is deliberate walkable-deck collision, rather than a misleading claim of collision against every triangle of an artistic model. The solar and lunar discs use a labelled viewing aid so an eclipse remains legible on a monitor. Near the horizon only, the Moon receives a restrained perceptual scale cue inspired by the Moon illusion; it never changes the simulation clock, astronomical direction, or calculated eclipse contacts. NASA notes that the real effect is perceptual—the Moon's image has essentially the same width at equal camera zoom near the horizon and high in the sky. [NASA explanation](https://science.nasa.gov/solar-system/moon/the-moon-illusion-why-does-the-moon-look-so-big-sometimes/)

Ocean observers can press **Z** (or use the HUD control) to cycle a sailboat, fishing trawler, cargo ship, and cruise ship. These are local GLTF assets from Kenney's [Watercraft Kit](https://kenney.nl/assets/watercraft-kit), licensed CC0; its license is retained beside the files. A shared multi-directional Gerstner-style field drives hull heave, pitch, roll, the GPU-displaced water, and crest-triggered foam. The water shader adds derivative normals, Fresnel reflection, solar glint, depth colour, and crest foam; a separate atmosphere dome supplies horizon haze and eclipse-sensitive stars. This is a real-time visual sea-state model—not fluid dynamics, CFD, or a naval-stability simulator. Sebastian Lague's [Fluid-Sim](https://github.com/SebLague/Fluid-Sim) is an SPH reference for contained fluid, deliberately not transplanted into this open-ocean renderer; the approach instead draws from the [ocean simulation and rendering survey](https://arxiv.org/abs/1109.6494).

- Elevation source: [NASA/ASTER Global Digital Elevation Map, equirectangular 3600 × 1800](https://commons.wikimedia.org/wiki/File:GDEM_elevation_map_3600x1800.png), public domain.

The cloud layer is a locally computed, deterministic atmosphere simulation, not an image and not a live or historical weather-data layer. A low-resolution latitude/longitude field evolves humidity, temperature, and cloud water: latitude wind bands and seeded cyclonic disturbances advect it; saturation causes condensation; neighbouring cells diffuse it; and warm, dry air dissipates it. Its evolving RGBA weather map drives a custom GPU cloud volume: multi-octave tileable density noise, an eight-step view march, and a three-step Sun-direction light march approximate transmittance, self-shadowing, and forward-lit edges. It is inspired by [Sebastian Lague's MIT-licensed cloud-rendering experiment](https://github.com/SebLague/Clouds), while remaining a visual approximation—not a forecast, an observed weather layer, or full cloud microphysics.

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
