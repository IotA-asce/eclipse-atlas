import { expect, it } from 'vitest'
import { sampleOcean, vesselAttitude } from './ocean'

it('returns deterministic wave elevation and a bounded vessel attitude', () => {
  expect(sampleOcean(3, -2, 4)).toEqual(sampleOcean(3, -2, 4))
  expect(Math.abs(sampleOcean(3, -2, 4).height)).toBeLessThanOrEqual(1.04)
  const attitude = vesselAttitude(14, 4, 4)
  expect(Math.abs(attitude.roll)).toBeLessThan(0.3)
  expect(Math.abs(attitude.pitch)).toBeLessThan(0.3)
})
