import { expect, it } from 'vitest'
import { restingBuoyancyState, stepBuoyancy } from './buoyancy'

it('integrates finite, damped multi-point hull motion', () => {
  let state = restingBuoyancyState()
  for (let frame = 0; frame < 120; frame += 1) state = stepBuoyancy(state, 12, 3.6, frame / 60, 1 / 60)
  expect(Number.isFinite(state.heave)).toBe(true)
  expect(Math.abs(state.pitch)).toBeLessThan(0.3)
  expect(Math.abs(state.roll)).toBeLessThan(0.3)
})
