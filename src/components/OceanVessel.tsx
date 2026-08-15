import { Clone, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type MutableRefObject, useMemo, useRef } from 'react'
import { type Group, type Object3D } from 'three'
import { restingBuoyancyState, stepBuoyancy } from '../features/time-jump/buoyancy'
import type { VesselNavigation } from '../features/time-jump/vessel-navigation'
import { vesselSpecs, type VesselType } from '../features/time-jump/vessel-types'

const VesselAsset = ({ type }: { type: VesselType }) => {
  const spec = vesselSpecs[type]
  const { scene } = useGLTF(spec.model)
  return <Clone object={scene} scale={spec.scale} castShadow receiveShadow />
}

export const OceanVessel = ({ type, vesselRef, collisionRef, navigationRef }: { type: VesselType; vesselRef: MutableRefObject<Group | null>; collisionRef: MutableRefObject<Object3D | null>; navigationRef: MutableRefObject<VesselNavigation> }) => {
  const foam = useRef<Group>(null)
  const buoyancy = useRef(restingBuoyancyState())
  const spec = vesselSpecs[type]
  const dimensions = useMemo(() => [spec.deck.halfLength * 2, spec.deck.halfWidth * 2] as const, [spec])
  const { scene } = useGLTF(spec.model)
  const collisionScene = useMemo(() => scene.clone(true), [scene])
  useFrame(({ clock }, delta) => {
    if (!vesselRef.current) return
    const navigation = navigationRef.current
    buoyancy.current = stepBuoyancy(buoyancy.current, dimensions[0], dimensions[1], clock.getElapsedTime(), delta, navigation.x, navigation.z, navigation.heading)
    const attitude = buoyancy.current
    vesselRef.current.position.set(navigation.x, attitude.heave + 0.18, navigation.z)
    vesselRef.current.rotation.x = attitude.pitch
    vesselRef.current.rotation.y = navigation.heading
    vesselRef.current.rotation.z = attitude.roll
    if (foam.current) {
      const crest = Math.min(1, Math.abs(attitude.pitch) * 9 + Math.abs(attitude.roll) * 9)
      foam.current.scale.setScalar(0.78 + crest * 0.65)
      foam.current.visible = crest > 0.11
    }
  })
  return <group ref={vesselRef} data-testid="ocean-vessel">
    <VesselAsset key={type} type={type} />
    <primitive ref={collisionRef} object={collisionScene} scale={spec.scale} visible={false} />
    <group ref={foam} position={[0, 0.08, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[spec.deck.halfWidth * 0.92, 0.07, 8, 36]} /><meshBasicMaterial color="#e7fbff" transparent opacity={0.66} /></mesh>
      <mesh position={[0, 0.06, -spec.deck.halfLength]}><sphereGeometry args={[spec.deck.halfWidth * 0.44, 16, 10]} /><meshBasicMaterial color="#e7fbff" transparent opacity={0.36} /></mesh>
    </group>
  </group>
}

Object.values(vesselSpecs).forEach(({ model }) => useGLTF.preload(model))
