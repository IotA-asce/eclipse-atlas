import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls, useTexture } from '@react-three/drei'
import { type MutableRefObject, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as Astronomy from 'astronomy-engine'
import { BackSide, Color, type Camera, type Group, type Object3D, NoColorSpace, Raycaster, RepeatWrapping, ShaderMaterial, Vector3, Vector4 } from 'three'
import { confineToDeck } from '../features/time-jump/deck-collision'
import { clipMovementAtContact } from '../features/time-jump/mesh-contact'
import { isLocationOnLand, type LandCollection } from '../features/time-jump/land-classifier'
import { createEclipseTimeline, eclipseCoverageAt, timelineDate } from '../features/time-jump/timeline'
import type { LocalSolarEclipse, ObserverLocation } from '../features/eclipse/types'
import { OceanVessel } from './OceanVessel'
import { vesselSpecs, vesselTypes, type VesselType } from '../features/time-jump/vessel-types'

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
  const initialDirection = useRef(direction.clone())
  useEffect(() => {
    camera.position.set(0, 1.65, 0)
    camera.lookAt(initialDirection.current.clone().multiplyScalar(25).add(new Vector3(0, 1.65, 0)))
  }, [camera])
  return null
}

const DeckCamera = ({ vesselRef, type }: { vesselRef: MutableRefObject<Group | null>; type: VesselType }) => {
  const { camera } = useThree()
  const initialized = useRef(false)
  useFrame(() => {
    if (initialized.current || !vesselRef.current) return
    const deck = vesselSpecs[type].deck
    vesselRef.current.updateMatrixWorld(true)
    camera.position.set(0, deck.deckHeight + 1.65, deck.halfLength * 0.5)
    vesselRef.current.localToWorld(camera.position)
    initialized.current = true
  })
  return null
}

const FirstPersonMovement = () => {
  const { camera } = useThree()
  const { gl } = useThree()
  const held = useRef(new Set<string>())
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (document.pointerLockElement !== gl.domElement) return
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) event.preventDefault()
      held.current.add(event.code)
    }
    const up = (event: KeyboardEvent) => held.current.delete(event.code)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [gl])
  useEffect(() => {
    const listener = () => { held.current.clear() }
    window.addEventListener('blur', listener)
    return () => window.removeEventListener('blur', listener)
  }, [])
  return <MovementFrame camera={camera} held={held} />
}

const MovementFrame = ({ camera, held }: { camera: Camera; held: MutableRefObject<Set<string>> }) => {
  const forward = useMemo(() => new Vector3(), [])
  const right = useMemo(() => new Vector3(), [])
  const displacement = useMemo(() => new Vector3(), [])
  useFrame((_, delta) => {
    const keys = held.current
    forward.set(0, 0, -1).applyQuaternion(camera.quaternion); forward.y = 0; forward.normalize()
    right.set(1, 0, 0).applyQuaternion(camera.quaternion); right.y = 0; right.normalize()
    displacement.set(0, 0, 0)
    if (keys.has('KeyW')) displacement.add(forward)
    if (keys.has('KeyS')) displacement.sub(forward)
    if (keys.has('KeyD')) displacement.add(right)
    if (keys.has('KeyA')) displacement.sub(right)
    if (displacement.lengthSq() > 0) camera.position.addScaledVector(displacement.normalize(), Math.min(delta, 0.05) * 4.2)
  })
  return null
}

const ShipDeckMovement = ({ type, vesselRef, collisionRef }: { type: VesselType; vesselRef: MutableRefObject<Group | null>; collisionRef: MutableRefObject<Object3D | null> }) => {
  const { camera, gl } = useThree()
  const held = useRef(new Set<string>())
  const previousHullPosition = useRef<Vector3 | null>(null)
  const forward = useMemo(() => new Vector3(), [])
  const right = useMemo(() => new Vector3(), [])
  const displacement = useMemo(() => new Vector3(), [])
  const local = useMemo(() => new Vector3(), [])
  const movementStart = useMemo(() => new Vector3(), [])
  const movementDirection = useMemo(() => new Vector3(), [])
  const contactRay = useMemo(() => new Raycaster(), [])
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (document.pointerLockElement !== gl.domElement) return
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(event.code)) event.preventDefault()
      held.current.add(event.code)
    }
    const up = (event: KeyboardEvent) => held.current.delete(event.code)
    const clear = () => held.current.clear()
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', clear)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', clear) }
  }, [gl])
  useFrame((_, delta) => {
    const hull = vesselRef.current
    if (!hull) return
    hull.updateMatrixWorld(true)
    const hullPosition = hull.getWorldPosition(new Vector3())
    if (previousHullPosition.current) camera.position.add(hullPosition.clone().sub(previousHullPosition.current))
    previousHullPosition.current = hullPosition
    forward.set(0, 0, -1).applyQuaternion(camera.quaternion); forward.y = 0; forward.normalize()
    right.set(1, 0, 0).applyQuaternion(camera.quaternion); right.y = 0; right.normalize()
    displacement.set(0, 0, 0)
    if (held.current.has('KeyW')) displacement.add(forward)
    if (held.current.has('KeyS')) displacement.sub(forward)
    if (held.current.has('KeyD')) displacement.add(right)
    if (held.current.has('KeyA')) displacement.sub(right)
    movementStart.copy(camera.position)
    if (displacement.lengthSq() > 0) {
      const travel = Math.min(delta, 0.05) * 2.6
      camera.position.addScaledVector(displacement.normalize(), travel)
      const travelVector = camera.position.clone().sub(movementStart)
      const travelDistance = travelVector.length()
      if (travelDistance > 0 && collisionRef.current) {
        movementDirection.copy(travelVector).normalize()
        contactRay.set(movementStart, movementDirection)
        const hit = contactRay.intersectObject(collisionRef.current, true)[0]
        if (hit && hit.distance < travelDistance) {
          const clipped = clipMovementAtContact({ x: movementStart.x, z: movementStart.z }, { x: camera.position.x, z: camera.position.z }, hit.distance)
          camera.position.set(clipped.x, camera.position.y, clipped.z)
        }
      }
    }
    local.copy(camera.position); hull.worldToLocal(local)
    const spec = vesselSpecs[type]
    const confined = confineToDeck({ x: local.x, z: local.z }, spec.deck, spec.obstacles)
    local.set(confined.x, spec.deck.deckHeight + 1.65, confined.z)
    hull.localToWorld(local)
    camera.position.copy(local)
  })
  return null
}

const Terrain = ({ location }: { location: ObserverLocation }) => {
  const elevation = useTexture('/textures/aster-gdem-elevation-3600.png')
  useEffect(() => { elevation.colorSpace = NoColorSpace; elevation.wrapS = RepeatWrapping; elevation.wrapT = RepeatWrapping; elevation.repeat.set(0.025, 0.025); elevation.offset.set((location.longitude + 180) / 360, (90 - location.latitude) / 180); elevation.needsUpdate = true }, [elevation, location])
  return <mesh position={[0, -1.4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[160, 160, 160, 160]} /><meshStandardMaterial color="#4b5635" displacementMap={elevation} displacementScale={4.2} displacementBias={-1.4} roughness={0.96} /></mesh>
}

const WaterSurface = ({ sun, coverage, vessel, vesselRef }: { sun: Vector3; coverage: number; vessel: VesselType; vesselRef: MutableRefObject<Group | null> }) => {
  const material = useMemo(() => new ShaderMaterial({ transparent: false, uniforms: { time: { value: 0 }, sunDirection: { value: new Vector3(0, 1, 0) }, eclipse: { value: 0 }, hullMask: { value: new Vector4(0, 0, 0, 0) } }, vertexShader: `uniform float time; varying vec3 vWorld; varying float vCrest;
    float wave(vec2 p, vec2 dir, float length, float amplitude, float speed){ return amplitude*sin(dot(p,dir)*6.28318/length-speed*time); }
    void main(){ vec3 p=position; vec2 q=p.xy; float h=wave(q,normalize(vec2(.92,.38)),12.,.42,1.45)+wave(q,normalize(vec2(-.4,.92)),6.5,.24,2.1)+wave(q,normalize(vec2(.67,-.74)),3.2,.12,3.3)+wave(q,normalize(vec2(-.8,-.58)),19.,.26,.82); p.z+=h; vCrest=smoothstep(.35,.82,h); vec4 world=modelMatrix*vec4(p,1.); vWorld=world.xyz; gl_Position=projectionMatrix*viewMatrix*world; }`, fragmentShader: `uniform vec3 sunDirection; uniform float eclipse; varying vec3 vWorld; varying float vCrest;
    void main(){ vec2 hullOffset=abs(vWorld.xz-hullMask.xy)-hullMask.zw; if(max(hullOffset.x,hullOffset.y)<0.) discard; vec3 normal=normalize(cross(dFdx(vWorld),dFdy(vWorld))); if(!gl_FrontFacing) normal=-normal; vec3 view=normalize(cameraPosition-vWorld); float fresnel=pow(1.-max(dot(view,normal),0.),5.); vec3 light=normalize(sunDirection); vec3 halfVector=normalize(view+light); float glint=pow(max(dot(normal,halfVector),0.),180.)*(1.-eclipse*.7); vec3 deep=vec3(.004,.035,.075); vec3 horizon=vec3(.035,.24,.36); vec3 color=mix(deep,horizon,fresnel*.85+max(normal.y,0.)*.12); color+=vec3(1.,.78,.4)*glint; color=mix(color,vec3(.78,.9,.88),vCrest*(.22+.55*fresnel)); gl_FragColor=vec4(color,1.); }` }), [])
  useFrame(({ clock }) => {
    material.uniforms.time.value = clock.getElapsedTime()
    const spec = vesselSpecs[vessel]
    const position = vesselRef.current?.position
    material.uniforms.hullMask.value.set(position?.x ?? 0, position?.z ?? 0, spec.deck.halfWidth + spec.waterMaskPadding, spec.deck.halfLength + spec.waterMaskPadding)
  })
  useEffect(() => { material.uniforms.sunDirection.value.copy(sun).normalize(); material.uniforms.eclipse.value = coverage }, [coverage, material, sun])
  useEffect(() => () => material.dispose(), [material])
  return <mesh position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[300, 300, 220, 220]} /><primitive object={material} attach="material" /></mesh>
}

const SkyDome = ({ sun, coverage }: { sun: Vector3; coverage: number }) => {
  const material = useMemo(() => new ShaderMaterial({ side: BackSide, uniforms: { sunDirection: { value: new Vector3(0, 1, 0) }, eclipse: { value: 0 } }, vertexShader: 'varying vec3 vDirection; void main(){ vDirection=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }', fragmentShader: `uniform vec3 sunDirection; uniform float eclipse; varying vec3 vDirection;
    float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    void main(){ float horizon=pow(1.-max(vDirection.y,0.),1.7); float day=1.-eclipse*.92; vec3 zenith=mix(vec3(.002,.005,.014),vec3(.018,.14,.32),day); vec3 haze=mix(vec3(.01,.012,.02),vec3(.48,.63,.72),day); vec3 color=mix(zenith,haze,horizon); float solar=pow(max(dot(normalize(vDirection),normalize(sunDirection)),0.),260.)+pow(max(dot(normalize(vDirection),normalize(sunDirection)),0.),14.)*.1; color+=vec3(1.,.55,.18)*solar*day; float stars=step(.9978,hash(floor(vDirection.xz*950.))) * smoothstep(.23,.02,day) * smoothstep(-.16,.12,vDirection.y); color+=vec3(stars); gl_FragColor=vec4(color,1.); }` }), [])
  useEffect(() => { material.uniforms.sunDirection.value.copy(sun).normalize(); material.uniforms.eclipse.value = coverage }, [coverage, material, sun])
  useEffect(() => () => material.dispose(), [material])
  return <mesh><sphereGeometry args={[220, 48, 32]} /><primitive object={material} attach="material" /></mesh>
}

const ObserverWorld = ({ location, time, coverage, onLand, vessel, vesselRef, collisionRef }: { location: ObserverLocation; time: Date; coverage: number; onLand: boolean; vessel: VesselType; vesselRef: MutableRefObject<Group | null>; collisionRef: MutableRefObject<Object3D | null> }) => {
  const sun = useMemo(() => bodyDirection(Astronomy.Body.Sun, location, time), [location, time])
  const moon = useMemo(() => bodyDirection(Astronomy.Body.Moon, location, time), [location, time])
  const sky = new Color().setHSL(0.59, 0.45, Math.max(0.025, 0.24 * (1 - coverage * 0.9)))
  const sunPosition = sun.clone().multiplyScalar(80).add(new Vector3(0, 1.65, 0))
  const moonPosition = moon.clone().multiplyScalar(78).add(new Vector3(0, 1.65, 0))
  return <>
    <color attach="background" args={[sky]} />
    <ObserverCamera direction={sun} />
    <SkyDome sun={sun} coverage={coverage} />
    <hemisphereLight intensity={0.18 * (1 - coverage)} color="#8db6e8" groundColor="#10151d" />
    <directionalLight position={sunPosition} intensity={2.5 * (1 - coverage * 0.86)} color="#fff1c6" castShadow />
    {onLand ? <Terrain location={location} /> : <WaterSurface sun={sun} coverage={coverage} vessel={vessel} vesselRef={vesselRef} />}
    {onLand ? <group position={[0, 0, -4]}><mesh castShadow><boxGeometry args={[2.4, 0.9, 4.2]} /><meshStandardMaterial color="#18212a" roughness={0.8} /></mesh><mesh position={[0, 0.63, -0.2]} castShadow><boxGeometry args={[1.85, 0.5, 1.9]} /><meshStandardMaterial color="#596c78" roughness={0.6} /></mesh></group> : <><OceanVessel type={vessel} vesselRef={vesselRef} collisionRef={collisionRef} /><DeckCamera key={vessel} type={vessel} vesselRef={vesselRef} /></>}
    <mesh position={sunPosition} raycast={() => undefined}><sphereGeometry args={[0.84, 32, 20]} /><meshBasicMaterial color="#fff1bc" toneMapped={false} /></mesh>
    <pointLight position={sunPosition} intensity={2.2 * (1 - coverage * 0.6)} color="#ffe9ae" distance={180} />
    <mesh position={moonPosition} scale={1 + Math.max(0, 0.36 - moon.y) * 0.9} raycast={() => undefined}><sphereGeometry args={[0.78, 32, 20]} /><meshStandardMaterial color="#77767a" roughness={1} /></mesh>
  </>
}

export const EclipseTimeJump = ({ eclipse, location, onExit }: EclipseTimeJumpProps) => {
  const timeline = useMemo(() => createEclipseTimeline(eclipse), [eclipse])
  const [elapsed, setElapsed] = useState(0)
  const [rate, setRate] = useState(1)
  const [onLand, setOnLand] = useState<boolean | undefined>()
  const [vesselIndex, setVesselIndex] = useState(0)
  const vesselRef = useRef<Group | null>(null)
  const collisionRef = useRef<Object3D | null>(null)
  const vessel = vesselTypes[vesselIndex]
  useEffect(() => {
    let active = true
    void fetch('/data/ne_110m_land.geojson').then((response) => response.ok ? response.json() as Promise<LandCollection> : Promise.reject()).then((land) => { if (active) setOnLand(isLocationOnLand(location, land)) }).catch(() => { if (active) setOnLand(false) })
    return () => { active = false }
  }, [location])
  useEffect(() => {
    const cycleVessel = (event: KeyboardEvent) => {
      if (event.code !== 'KeyZ' || onLand !== false || event.repeat) return
      event.preventDefault()
      setVesselIndex((index) => (index + 1) % vesselTypes.length)
    }
    window.addEventListener('keydown', cycleVessel)
    return () => window.removeEventListener('keydown', cycleVessel)
  }, [onLand])
  useEffect(() => {
    const interval = window.setInterval(() => setElapsed((value) => Math.min(timeline.durationSeconds, value + rate * 0.1)), 100)
    return () => window.clearInterval(interval)
  }, [rate, timeline.durationSeconds])
  const simulatedTime = timelineDate(timeline, elapsed)
  const coverage = eclipseCoverageAt(eclipse, simulatedTime)
  const environment = onLand === undefined ? 'Reading terrain…' : onLand ? 'Roadside observer' : 'Ship-deck observer'
  return <main className="time-jump" aria-label="Eclipse time jump simulation">
    <Canvas className="time-jump__canvas" shadows="basic" camera={{ fov: 58, near: 0.1, far: 300 }}>
      {onLand === undefined ? null : <Suspense fallback={null}><ObserverWorld location={location} time={simulatedTime} coverage={coverage} onLand={onLand} vessel={vessel} vesselRef={vesselRef} collisionRef={collisionRef} />{onLand ? <FirstPersonMovement /> : <ShipDeckMovement type={vessel} vesselRef={vesselRef} collisionRef={collisionRef} />}<PointerLockControls /></Suspense>}
    </Canvas>
    <section className="time-jump__hud" aria-live="polite">
      <p className="eyebrow">Eclipse time jump · {environment}</p>
      <h1>{coverage > 0 ? `${Math.round(coverage * 100)}% coverage` : 'Awaiting first contact'}</h1>
      <p>{simulatedTime.toLocaleString()} · Click the view, then use WASD and mouse-look.</p>
      <div className="time-jump__controls" aria-label="Simulation rate">
        {[1, 30, 300].map((value) => <button type="button" className={rate === value ? 'is-active' : ''} onClick={() => setRate(value)} key={value}>{value}×</button>)}
        {onLand === false ? <button type="button" onClick={() => setVesselIndex((index) => (index + 1) % vesselTypes.length)}>Z · {vessel}</button> : null}
        <button type="button" onClick={onExit}>Exit simulation</button>
      </div>
    </section>
  </main>
}
