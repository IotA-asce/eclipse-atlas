import { sampleOcean } from './ocean'

export interface BuoyancyState { heave: number; pitch: number; roll: number; heaveVelocity: number; pitchVelocity: number; rollVelocity: number }
export const restingBuoyancyState = (): BuoyancyState => ({ heave: 0, pitch: 0, roll: 0, heaveVelocity: 0, pitchVelocity: 0, rollVelocity: 0 })

const spring = (value: number, velocity: number, target: number, frequency: number, delta: number) => {
  const acceleration = (target - value) * frequency * frequency - 2 * frequency * velocity
  const nextVelocity = velocity + acceleration * delta
  return { value: value + nextVelocity * delta, velocity: nextVelocity }
}

const sampleFloat = (originX: number, originZ: number, heading: number, x: number, z: number, time: number) => sampleOcean(originX + x * Math.cos(heading) + z * Math.sin(heading), originZ - x * Math.sin(heading) + z * Math.cos(heading), time).height

export const stepBuoyancy = (state: BuoyancyState, length: number, beam: number, time: number, delta: number, originX = 0, originZ = 0, heading = 0): BuoyancyState => {
  const dt = Math.min(Math.max(delta, 0), 0.05)
  const bow = sampleFloat(originX, originZ, heading, 0, -length / 2, time)
  const stern = sampleFloat(originX, originZ, heading, 0, length / 2, time)
  const port = sampleFloat(originX, originZ, heading, -beam / 2, 0, time)
  const starboard = sampleFloat(originX, originZ, heading, beam / 2, 0, time)
  const center = sampleFloat(originX, originZ, heading, 0, 0, time)
  const heave = spring(state.heave, state.heaveVelocity, (bow + stern + port + starboard + center) / 5, 3.8, dt)
  const pitch = spring(state.pitch, state.pitchVelocity, Math.atan2(bow - stern, length), 5.6, dt)
  const roll = spring(state.roll, state.rollVelocity, Math.atan2(port - starboard, beam), 5.6, dt)
  return { heave: heave.value, pitch: pitch.value, roll: roll.value, heaveVelocity: heave.velocity, pitchVelocity: pitch.velocity, rollVelocity: roll.velocity }
}
