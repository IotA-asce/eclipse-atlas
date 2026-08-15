import { OrbitControls } from '@react-three/drei'
import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { useState } from 'react'
import { BackSide, Vector3 } from 'three'
import type { Coordinates } from '../features/eclipse/coordinates'
import { coordinatesFromEarthIntersection } from './globe-intersection'

interface GlobeSceneProps {
  onSelectCoordinates: (coordinates: Coordinates) => void
  selectedCoordinates?: Coordinates
}

const EARTH_RADIUS = 1.8

const formatCoordinate = (value: number, positive: string, negative: string) =>
  `${Math.abs(value).toFixed(2)}° ${value >= 0 ? positive : negative}`

const coordinatesToPoint = ({ latitude, longitude }: Coordinates): [number, number, number] => {
  const latitudeRadians = (latitude * Math.PI) / 180
  const longitudeRadians = (longitude * Math.PI) / 180
  const horizontalRadius = EARTH_RADIUS * Math.cos(latitudeRadians)

  return [
    horizontalRadius * Math.cos(longitudeRadians),
    EARTH_RADIUS * Math.sin(latitudeRadians),
    horizontalRadius * Math.sin(longitudeRadians),
  ]
}

const SelectedLocationPin = ({ coordinates }: { coordinates: Coordinates }) => {
  const [x, y, z] = coordinatesToPoint(coordinates)
  const pinPosition = new Vector3(x, y, z).normalize().multiplyScalar(EARTH_RADIUS + 0.045)

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

const Earth = ({ onSelectCoordinates }: Pick<GlobeSceneProps, 'onSelectCoordinates'>) => {
  const handleEarthClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    const coordinates = coordinatesFromEarthIntersection(event.object, event.point)
    onSelectCoordinates(coordinates)
  }

  return (
    <>
      <mesh data-testid="earth-surface" onClick={handleEarthClick} castShadow receiveShadow>
        <sphereGeometry args={[EARTH_RADIUS, 96, 64]} />
        <meshStandardMaterial color="#17678f" roughness={0.72} metalness={0.08} emissive="#041522" emissiveIntensity={0.35} />
      </mesh>
      <mesh scale={1.004} raycast={() => undefined}>
        <sphereGeometry args={[EARTH_RADIUS, 48, 32]} />
        <meshBasicMaterial color="#8ad5ef" wireframe transparent opacity={0.13} />
      </mesh>
      <mesh scale={1.035} raycast={() => undefined}>
        <sphereGeometry args={[EARTH_RADIUS, 64, 48]} />
        <meshBasicMaterial color="#89d9ff" transparent opacity={0.07} side={BackSide} />
      </mesh>
    </>
  )
}

/**
 * A navigable Earth whose mesh axes match `pointToCoordinates`: Y is north,
 * X is longitude 0°, and positive Z is east.
 */
export const GlobeScene = ({ onSelectCoordinates, selectedCoordinates }: GlobeSceneProps) => {
  const [selectedLabel, setSelectedLabel] = useState('No location selected yet.')

  const selectCoordinates = (coordinates: Coordinates) => {
    setSelectedLabel(
      `Selected ${formatCoordinate(coordinates.latitude, 'N', 'S')}, ${formatCoordinate(coordinates.longitude, 'E', 'W')}`,
    )
    onSelectCoordinates(coordinates)
  }

  return (
    <section className="globe-scene" aria-label="Interactive Earth globe">
      <Canvas camera={{ position: [0, 0.4, 5.5], fov: 42 }} dpr={[1, 1.75]} shadows>
        <color attach="background" args={['#020711']} />
        <ambientLight intensity={0.32} />
        <directionalLight position={[-5, 3, 5]} intensity={2.1} color="#ffe6b0" castShadow />
        <pointLight position={[2, -3, -2]} intensity={0.18} color="#1a83bd" />
        <Earth onSelectCoordinates={selectCoordinates} />
        {selectedCoordinates ? <SelectedLocationPin coordinates={selectedCoordinates} /> : null}
        <OrbitControls enableDamping dampingFactor={0.08} enablePan={false} minDistance={3.2} maxDistance={8} />
      </Canvas>
      <output className="sr-only" aria-live="polite" aria-atomic="true">
        {selectedLabel}
      </output>
      <p className="globe-scene__hint">Drag to orbit · scroll to zoom · click Earth to select a location</p>
    </section>
  )
}
