import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'
import * as Astronomy from 'astronomy-engine'
import { Color, Vector3 } from 'three'
import { isLocationOnLand, type LandCollection } from '../features/time-jump/land-classifier'
import { createEclipseTimeline, eclipseCoverageAt, timelineDate } from '../features/time-jump/timeline'
import type { LocalSolarEclipse, ObserverLocation } from '../features/eclipse/types'

interface EclipseTimeJumpProps { eclipse: LocalSolarEclipse; location: ObserverLocation; onExit: () => void }

const horizontalVector = (altitude: number, azimuth: number) => {
  const altitudeRadians = altitude * Math.PI / 180
  const azimuthRadians = azimuth * Math.PI / 180
  return new Vector3(Math.cos(altitudeRadians) * Math.sin(azimuthRadians), Math.sin(altitudeRadians), -Math.cos(altitudeRadians) * Math.cos(azimuthRadians))
}

const bodyDirection = (body: Astronomy.Body, location: ObserverLocation, time: Date) => {
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.elevationMeters ?? 0)
  const equatorial = Astronomy.Equator(body, time, observer, true, true)
  const horizontal = Astronomy.Horizon(time, observer, equatorial.ra, equatorial.dec, 'normal')
  return horizontalVector(horizontal.altitude, horizontal.azimuth)
}

const ObserverCamera = ({ direction }: { direction: Vector3 }) => {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(0, 1.65, 0)
    camera.lookAt(direction.clone().multiplyScalar(25).add(new Vector3(0, 1.65, 0)))
  }, [camera, direction])
  return null
}

const ObserverWorld = ({ location, time, coverage, onLand }: { location: ObserverLocation; time: Date; coverage: number; onLand: boolean }) => {
  const sun = useMemo(() => bodyDirection(Astronomy.Body.Sun, location, time), [location, time])
  const moon = useMemo(() => bodyDirection(Astronomy.Body.Moon, location, time), [location, time])
  const sky = new Color().setHSL(0.59, 0.45, Math.max(0.025, 0.24 * (1 - coverage * 0.9)))
  const sunPosition = sun.clone().multiplyScalar(80).add(new Vector3(0, 1.65, 0))
  const moonPosition = moon.clone().multiplyScalar(78).add(new Vector3(0, 1.65, 0))
  return <>
    <color attach="background" args={[sky]} />
    <ObserverCamera direction={sun} />
    <hemisphereLight intensity={0.18 * (1 - coverage)} color="#8db6e8" groundColor="#10151d" />
    <directionalLight position={sunPosition} intensity={2.5 * (1 - coverage * 0.86)} color="#fff1c6" castShadow />
    <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[300, 300]} />
      <meshStandardMaterial color={onLand ? '#27301d' : '#123a54'} roughness={onLand ? 0.94 : 0.32} metalness={onLand ? 0 : 0.18} />
    </mesh>
    {onLand ? <group position={[0, 0, -4]}><mesh castShadow><boxGeometry args={[2.4, 0.9, 4.2]} /><meshStandardMaterial color="#18212a" roughness={0.8} /></mesh><mesh position={[0, 0.63, -0.2]} castShadow><boxGeometry args={[1.85, 0.5, 1.9]} /><meshStandardMaterial color="#596c78" roughness={0.6} /></mesh></group> : <group position={[0, 0.45, -4]}><mesh><boxGeometry args={[8, 0.3, 16]} /><meshStandardMaterial color="#5b4632" roughness={0.8} /></mesh><mesh position={[-2.7, 0.7, -2]}><boxGeometry args={[0.12, 1.2, 0.12]} /><meshStandardMaterial color="#e4d4ad" /></mesh></group>}
    <mesh position={sunPosition} raycast={() => undefined}><sphereGeometry args={[0.42, 32, 20]} /><meshBasicMaterial color="#fff1bc" toneMapped={false} /></mesh>
    <pointLight position={sunPosition} intensity={2.2 * (1 - coverage * 0.6)} color="#ffe9ae" distance={180} />
    <mesh position={moonPosition} raycast={() => undefined}><sphereGeometry args={[0.39, 32, 20]} /><meshStandardMaterial color="#77767a" roughness={1} /></mesh>
  </>
}

export const EclipseTimeJump = ({ eclipse, location, onExit }: EclipseTimeJumpProps) => {
  const timeline = useMemo(() => createEclipseTimeline(eclipse), [eclipse])
  const [elapsed, setElapsed] = useState(0)
  const [rate, setRate] = useState(1)
  const [onLand, setOnLand] = useState<boolean | undefined>()
  useEffect(() => {
    let active = true
    void fetch('/data/ne_110m_land.geojson').then((response) => response.ok ? response.json() as Promise<LandCollection> : Promise.reject()).then((land) => { if (active) setOnLand(isLocationOnLand(location, land)) }).catch(() => { if (active) setOnLand(false) })
    return () => { active = false }
  }, [location])
  useEffect(() => {
    const interval = window.setInterval(() => setElapsed((value) => Math.min(timeline.durationSeconds, value + rate * 0.1)), 100)
    return () => window.clearInterval(interval)
  }, [rate, timeline.durationSeconds])
  const simulatedTime = timelineDate(timeline, elapsed)
  const coverage = eclipseCoverageAt(eclipse, simulatedTime)
  const environment = onLand === undefined ? 'Reading terrain…' : onLand ? 'Roadside observer' : 'Ship-deck observer'
  return <main className="time-jump" aria-label="Eclipse time jump simulation">
    <Canvas className="time-jump__canvas" shadows camera={{ fov: 58, near: 0.1, far: 300 }}>
      {onLand === undefined ? null : <ObserverWorld location={location} time={simulatedTime} coverage={coverage} onLand={onLand} />}
    </Canvas>
    <section className="time-jump__hud" aria-live="polite">
      <p className="eyebrow">Eclipse time jump · {environment}</p>
      <h1>{coverage > 0 ? `${Math.round(coverage * 100)}% coverage` : 'Awaiting first contact'}</h1>
      <p>{simulatedTime.toLocaleString()}</p>
      <div className="time-jump__controls" aria-label="Simulation rate">
        {[1, 30, 300].map((value) => <button type="button" className={rate === value ? 'is-active' : ''} onClick={() => setRate(value)} key={value}>{value}×</button>)}
        <button type="button" onClick={onExit}>Exit simulation</button>
      </div>
    </section>
  </main>
}
