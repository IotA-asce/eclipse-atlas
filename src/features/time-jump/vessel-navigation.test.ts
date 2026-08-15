import { expect, it } from 'vitest'
import { restingNavigation, stepVesselNavigation } from './vessel-navigation'

it('accelerates, turns, and stays within its commanded speed envelope', () => {
  let state = restingNavigation()
  for (let frame = 0; frame < 180; frame += 1) state = stepVesselNavigation(state, { throttle: 1, rudder: 0.6 }, 1 / 60)
  expect(state.speed).toBeGreaterThan(6)
  expect(state.speed).toBeLessThanOrEqual(8)
  expect(Math.abs(state.heading)).toBeGreaterThan(0.1)
  expect(Math.hypot(state.x, state.z)).toBeGreaterThan(1)
})
