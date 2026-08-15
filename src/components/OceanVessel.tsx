import { useFrame } from '@react-three/fiber'
import { type Group } from 'three'
import { useRef } from 'react'
import { vesselAttitude } from '../features/time-jump/ocean'
import type { VesselType } from '../features/time-jump/vessel-types'

const Hull = ({ color, length, beam, height }: { color: string; length: number; beam: number; height: number }) => <group><mesh position={[0, height / 2, 0]} castShadow receiveShadow><boxGeometry args={[beam, height, length]} /><meshStandardMaterial color={color} roughness={0.58} metalness={0.28} /></mesh><mesh position={[0, height, -length / 2]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[beam * 0.72, height, 4]} /><meshStandardMaterial color={color} roughness={0.6} metalness={0.2} /></mesh></group>

const VesselForm = ({ type }: { type: VesselType }) => {
  if (type === 'Sailboat') return <><Hull color="#f4f1df" length={8} beam={2.3} height={0.8} /><mesh position={[0, 4.4, 0.6]}><cylinderGeometry args={[0.07, 0.07, 8, 10]} /><meshStandardMaterial color="#624b35" /></mesh><mesh position={[0.08, 4.4, -0.5]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[4.8, 6.3]} /><meshStandardMaterial color="#f8f2d9" side={2} /></mesh></>
  if (type === 'Fishing trawler') return <><Hull color="#cf6a3c" length={12} beam={3.6} height={1.3} /><mesh position={[0, 1.9, 1]}><boxGeometry args={[2.4, 1.4, 3.4]} /><meshStandardMaterial color="#ecdfbc" /></mesh><mesh position={[0, 4.2, 1]}><cylinderGeometry args={[0.08, 0.08, 3.5, 8]} /><meshStandardMaterial color="#30383d" /></mesh><mesh position={[0, 3.2, -2.6]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.06, 5.8, 8]} /><meshStandardMaterial color="#30383d" /></mesh></>
  if (type === 'Cargo ship') return <><Hull color="#1d3651" length={28} beam={7.2} height={2.2} /><mesh position={[0, 3.1, 7]}><boxGeometry args={[4.2, 2.2, 4.2]} /><meshStandardMaterial color="#f1eee1" /></mesh>{[-7, -2, 3].map((z) => <mesh key={z} position={[0, 3.2, z]}><boxGeometry args={[5.8, 1.8, 4.3]} /><meshStandardMaterial color="#a94332" roughness={0.75} /></mesh>)}</>
  return <><Hull color="#f4f4ed" length={32} beam={8.5} height={2.5} /><mesh position={[0, 5, 0]}><boxGeometry args={[7.2, 5, 22]} /><meshStandardMaterial color="#f6f3e8" /></mesh>{[2.8, 4.4, 6].map((y) => <mesh key={y} position={[0, y, 0]}><boxGeometry args={[7.5, 0.18, 23]} /><meshStandardMaterial color="#cadbe1" /></mesh>)}<mesh position={[0, 7.2, 8]}><boxGeometry args={[5, 1.8, 4]} /><meshStandardMaterial color="#476d84" metalness={0.35} roughness={0.2} /></mesh></>
}

export const OceanVessel = ({ type }: { type: VesselType }) => {
  const vessel = useRef<Group>(null)
  const foam = useRef<Group>(null)
  const dimensions = type === 'Sailboat' ? [8, 2.3] : type === 'Fishing trawler' ? [12, 3.6] : type === 'Cargo ship' ? [28, 7.2] : [32, 8.5]
  useFrame(({ clock }) => {
    if (!vessel.current) return
    const attitude = vesselAttitude(dimensions[0], dimensions[1], clock.getElapsedTime())
    vessel.current.position.y = attitude.heave + 0.65
    vessel.current.rotation.x = attitude.pitch
    vessel.current.rotation.z = attitude.roll
    if (foam.current) {
      const crest = Math.min(1, Math.abs(attitude.pitch) * 8 + Math.abs(attitude.roll) * 8)
      foam.current.scale.setScalar(0.8 + crest * 0.6)
      foam.current.visible = crest > 0.14
    }
  })
  return <group ref={vessel} data-testid="ocean-vessel"><VesselForm type={type} /><group ref={foam} position={[0, -0.25, 0]}><mesh rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[dimensions[1] * 0.75, 0.11, 8, 36]} /><meshBasicMaterial color="#e8fbff" transparent opacity={0.7} /></mesh><mesh position={[0, 0.1, -dimensions[0] / 2]}><sphereGeometry args={[dimensions[1] * 0.45, 16, 10]} /><meshBasicMaterial color="#e8fbff" transparent opacity={0.45} /></mesh></group></group>
}
