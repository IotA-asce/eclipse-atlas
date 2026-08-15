export interface VesselNavigation { x: number; z: number; heading: number; speed: number }
export interface VesselInput { throttle: number; rudder: number }

export const restingNavigation = (): VesselNavigation => ({ x: 0, z: 0, heading: 0, speed: 0 })

export const stepVesselNavigation = (state: VesselNavigation, input: VesselInput, delta: number): VesselNavigation => {
  const dt = Math.min(Math.max(delta, 0), 0.05)
  const throttle = Math.max(-1, Math.min(1, input.throttle))
  const rudder = Math.max(-1, Math.min(1, input.rudder))
  const targetSpeed = throttle * 8
  const response = throttle === 0 ? 1.6 : 1.05
  const speed = state.speed + (targetSpeed - state.speed) * Math.min(1, response * dt)
  const heading = state.heading + rudder * speed * 0.11 * dt
  return { x: state.x - Math.sin(heading) * speed * dt, z: state.z - Math.cos(heading) * speed * dt, heading, speed }
}
