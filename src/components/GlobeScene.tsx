import { OrbitControls, useTexture } from '@react-three/drei'
import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { Component, type ErrorInfo, type ReactNode, Suspense, useEffect, useMemo, useState } from 'react'
import { AdditiveBlending, BackSide, SRGBColorSpace, Vector3 } from 'three'
import type { Coordinates } from '../features/eclipse/coordinates'
import { configureEarthMapTexture } from './earth-texture'
import { majorCities } from './geography-data'
import { coordinatesToSurfacePoint, splitLineAtAntimeridian, type LongitudeLatitude } from './geography'
import { coordinatesFromEarthIntersection } from './globe-intersection'
import * as Astronomy from 'astronomy-engine'

interface GlobeSceneProps {
  onSelectCoordinates: (coordinates: Coordinates) => void
  selectedCoordinates?: Coordinates
}

const EARTH_RADIUS = 1.8
// Physical radii relative to Earth's radius. Distances are calculated live from Astronomy Engine.
const MOON_RADIUS = EARTH_RADIUS * 0.2727
const SUN_RADIUS = EARTH_RADIUS * 109.1
const EARTH_RADIUS_KM = 6371
const EARTH_MAP_URL = '/textures/earth-blue-marble-5400.png'
const MOON_MAP_URL = '/textures/moon-lroc-color-2k.jpg'
const BORDER_DATA_URL = '/data/ne_110m_admin_0_boundary_lines_land.geojson'

const formatCoordinate = (value: number, positive: string, negative: string) =>
  `${Math.abs(value).toFixed(2)}° ${value >= 0 ? positive : negative}`

const SelectedLocationPin = ({ coordinates }: { coordinates: Coordinates }) => {
  const pinPosition = coordinatesToSurfacePoint(coordinates, EARTH_RADIUS + 0.045)

  return (
    <group position={pinPosition.toArray()} data-testid="selected-location-pin">
      <mesh>
        <sphereGeometry args={[0.075, 20, 20]} />
        <meshBasicMaterial color="#ffd27a" toneMapped={false} />
      </mesh>
      <mesh scale={1.65}>
        <sphereGeometry args={[0.075, 20, 20]} />
        <meshBasicMaterial color="#ffd27a" transparent opacity={0.16} toneMapped={false} />
      </mesh>
    </group>
  )
}

type GeoJsonGeometry = { type: 'LineString' | 'MultiLineString'; coordinates: LongitudeLatitude[] | LongitudeLatitude[][] }
type GeoJsonFeature = { geometry: GeoJsonGeometry }
type GeoJsonCollection = { features: GeoJsonFeature[] }

const extractBorderLines = (collection: GeoJsonCollection) => collection.features.flatMap(({ geometry }) => {
  const lines = geometry.type === 'LineString' ? [geometry.coordinates as LongitudeLatitude[]] : geometry.coordinates as LongitudeLatitude[][]
  return lines.flatMap(splitLineAtAntimeridian).filter((line) => line.length > 1)
})

const GeographicBorders = () => {
  const [borderLines, setBorderLines] = useState<LongitudeLatitude[][]>([])

  useEffect(() => {
    let active = true
    void fetch(BORDER_DATA_URL)
      .then((response) => response.ok ? response.json() as Promise<GeoJsonCollection> : Promise.reject(new Error('Border data unavailable')))
      .then((collection) => { if (active) setBorderLines(extractBorderLines(collection)) })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  const positions = useMemo(() => {
    const values: number[] = []
    for (const line of borderLines) {
      for (let index = 1; index < line.length; index += 1) {
        values.push(...coordinatesToSurfacePoint({ longitude: line[index - 1][0], latitude: line[index - 1][1] }, EARTH_RADIUS + 0.011).toArray())
        values.push(...coordinatesToSurfacePoint({ longitude: line[index][0], latitude: line[index][1] }, EARTH_RADIUS + 0.011).toArray())
      }
    }
    return new Float32Array(values)
  }, [borderLines])

  if (positions.length === 0) return null
  return <lineSegments raycast={() => undefined} data-testid="geographic-borders">
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <lineBasicMaterial color="#e9f5e7" transparent opacity={0.48} depthWrite={false} />
  </lineSegments>
}

const MajorCityMarkers = () => <group data-testid="major-city-markers">
  {majorCities.map((city) => <mesh key={city.name} position={coordinatesToSurfacePoint(city, EARTH_RADIUS + 0.026)} raycast={() => undefined}>
    <sphereGeometry args={[0.018, 10, 10]} />
    <meshBasicMaterial color="#ffd37b" toneMapped={false} />
  </mesh>)}
</group>

const EarthMaterial = ({ onLoaded }: { onLoaded: () => void }) => {
  const texture = useTexture(EARTH_MAP_URL)

  useEffect(() => {
    configureEarthMapTexture(texture)
    onLoaded()
  }, [onLoaded, texture])

  return <meshStandardMaterial map={texture} roughness={0.78} metalness={0.02} emissive="#041522" emissiveIntensity={0.12} />
}

class EarthTextureBoundary extends Component<{ children: ReactNode; onError: () => void; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(_: Error, __: ErrorInfo) {
    this.props.onError()
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

const Earth = ({ onSelectCoordinates, onMapLoaded, onMapError }: Pick<GlobeSceneProps, 'onSelectCoordinates'> & { onMapLoaded: () => void; onMapError: () => void }) => {
  const handleEarthClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    const coordinates = coordinatesFromEarthIntersection(event.object, event.point)
    onSelectCoordinates(coordinates)
  }

  return (
    <>
      <mesh data-testid="earth-surface" onClick={handleEarthClick} castShadow receiveShadow>
        <sphereGeometry args={[EARTH_RADIUS, 96, 64]} />
        <EarthTextureBoundary
          onError={onMapError}
          fallback={<meshStandardMaterial color="#17678f" roughness={0.72} metalness={0.08} emissive="#041522" emissiveIntensity={0.35} />}
        >
          <Suspense fallback={<meshStandardMaterial color="#17678f" roughness={0.72} metalness={0.08} emissive="#041522" emissiveIntensity={0.35} />}>
            <EarthMaterial onLoaded={onMapLoaded} />
          </Suspense>
        </EarthTextureBoundary>
      </mesh>
      <mesh scale={1.004} raycast={() => undefined}>
        <sphereGeometry args={[EARTH_RADIUS, 48, 32]} />
        <meshBasicMaterial color="#8ad5ef" wireframe transparent opacity={0.13} />
      </mesh>
      <mesh scale={1.035} raycast={() => undefined}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 48]} />
        <meshBasicMaterial color="#89d9ff" transparent opacity={0.07} side={BackSide} />
      </mesh>
      <GeographicBorders />
      <MajorCityMarkers />
    </>
  )
}

const skyVector = (altitudeDegrees: number, azimuthDegrees: number, radius: number) => {
  const altitude = altitudeDegrees * Math.PI / 180
  const azimuth = azimuthDegrees * Math.PI / 180
  return new Vector3(radius * Math.cos(altitude) * Math.sin(azimuth), radius * Math.sin(altitude), radius * Math.cos(altitude) * Math.cos(azimuth))
}

const CelestialIllustration = ({ observer }: { observer?: Coordinates }) => {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const interval = window.setInterval(() => setTime(new Date()), 60_000)
    return () => window.clearInterval(interval)
  }, [])
  const { sun, moon } = useMemo(() => {
    const location = observer ?? { latitude: 0, longitude: 0 }
    const astroObserver = new Astronomy.Observer(location.latitude, location.longitude, 0)
    const horizontal = (body: Astronomy.Body) => {
      const equatorial = Astronomy.Equator(body, time, astroObserver, true, true)
      const horizon = Astronomy.Horizon(time, astroObserver, equatorial.ra, equatorial.dec, 'normal')
      return { horizon, distanceEarthRadii: equatorial.dist * Astronomy.KM_PER_AU / EARTH_RADIUS_KM }
    }
    const sun = horizontal(Astronomy.Body.Sun)
    const moon = horizontal(Astronomy.Body.Moon)
    return {
      sun: skyVector(sun.horizon.altitude, sun.horizon.azimuth, sun.distanceEarthRadii * EARTH_RADIUS),
      moon: skyVector(moon.horizon.altitude, moon.horizon.azimuth, moon.distanceEarthRadii * EARTH_RADIUS),
    }
  }, [observer, time])

  return (
    <>
      <group position={sun.toArray()} raycast={() => undefined}>
        <directionalLight intensity={2.6} color="#fff0c7" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <mesh>
          <sphereGeometry args={[SUN_RADIUS, 48, 32]} />
          <meshBasicMaterial color="#fff2c2" toneMapped={false} />
        </mesh>
        <mesh scale={1.35}>
          <sphereGeometry args={[SUN_RADIUS, 48, 32]} />
          <meshBasicMaterial color="#ffbf5a" transparent opacity={0.08} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      <group position={moon.toArray()} raycast={() => undefined}>
        <Moon />
      </group>
    </>
  )
}

const RealStarField = ({ observer }: { observer?: Coordinates }) => {
  const [time, setTime] = useState(() => new Date())
  const [catalog, setCatalog] = useState<Array<[number, number, number]>>([])
  useEffect(() => {
    const interval = window.setInterval(() => setTime(new Date()), 60_000)
    return () => window.clearInterval(interval)
  }, [])
  useEffect(() => {
    let active = true
    void fetch('/data/hyg-v41-mag-6_5.json')
      .then((response) => response.ok ? response.json() as Promise<Array<[number, number, number]>> : [])
      .then((stars) => { if (active) setCatalog(stars) })
      .catch(() => undefined)
    return () => { active = false }
  }, [])
  const positions = useMemo(() => {
    const location = observer ?? { latitude: 0, longitude: 0 }
    const astroObserver = new Astronomy.Observer(location.latitude, location.longitude, 0)
    const values: number[] = []
    for (const [ra, dec] of catalog) {
      const horizontal = Astronomy.Horizon(time, astroObserver, ra, dec, 'normal')
      if (horizontal.altitude <= 0) continue
      const altitude = horizontal.altitude * Math.PI / 180
      const azimuth = horizontal.azimuth * Math.PI / 180
      // Stars are effectively at infinity; this shell remains beyond the Moon while preserving their directions.
      const radius = EARTH_RADIUS * 200
      values.push(radius * Math.cos(altitude) * Math.sin(azimuth), radius * Math.sin(altitude), radius * Math.cos(altitude) * Math.cos(azimuth))
    }
    return new Float32Array(values)
  }, [catalog, observer, time])
  return <points data-testid="real-star-field" raycast={() => undefined}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <pointsMaterial color="#fff7df" size={0.028} sizeAttenuation transparent opacity={0.9} depthWrite={false} />
  </points>
}

const Moon = () => {
  const texture = useTexture(MOON_MAP_URL)
  useEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
  }, [texture])

  return <mesh castShadow receiveShadow>
    <sphereGeometry args={[MOON_RADIUS, 64, 48]} />
    <meshStandardMaterial map={texture} roughness={0.94} metalness={0} />
  </mesh>
}

/**
 * A navigable Earth whose mesh axes match `pointToCoordinates`: Y is north,
 * X is longitude 0°, and positive Z is east.
 */
export const GlobeScene = ({ onSelectCoordinates, selectedCoordinates }: GlobeSceneProps) => {
  const [selectedLabel, setSelectedLabel] = useState('No location selected yet.')
  const [mapState, setMapState] = useState<'loading' | 'ready' | 'error'>('loading')

  const selectCoordinates = (coordinates: Coordinates) => {
    setSelectedLabel(
      `Selected ${formatCoordinate(coordinates.latitude, 'N', 'S')}, ${formatCoordinate(coordinates.longitude, 'E', 'W')}`,
    )
    onSelectCoordinates(coordinates)
  }

  return (
    <section className="globe-scene" aria-label="Interactive Earth globe">
      <Canvas camera={{ position: [0, 0.4, 5.5], fov: 42, far: EARTH_RADIUS * 30_000 }} dpr={[1, 1.75]} shadows>
        <color attach="background" args={['#00030a']} />
        <ambientLight intensity={0.035} />
        <RealStarField observer={selectedCoordinates} />
        <Earth onSelectCoordinates={selectCoordinates} onMapLoaded={() => setMapState('ready')} onMapError={() => setMapState('error')} />
        {selectedCoordinates ? <SelectedLocationPin coordinates={selectedCoordinates} /> : null}
        <CelestialIllustration observer={selectedCoordinates} />
        <OrbitControls enableDamping dampingFactor={0.08} enablePan={false} minDistance={3.2} maxDistance={EARTH_RADIUS * 100} />
      </Canvas>
      {mapState === 'loading' ? <p className="globe-scene__status" role="status">Loading Earth map…</p> : null}
      {mapState === 'error' ? <p className="globe-scene__status globe-scene__status--error" role="status">Earth map unavailable. Selecting still works.</p> : null}
      <output className="sr-only" aria-live="polite" aria-atomic="true">
        {selectedLabel}
      </output>
      <p className="globe-scene__hint">Drag to orbit · scroll to zoom · click Earth to select a location</p>
    </section>
  )
}
