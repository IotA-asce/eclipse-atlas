import { Vector3 } from 'three'
import { describe, expect, it } from 'vitest'
import { coordinatesToSurfacePoint, minimumMoonDistance, splitLineAtAntimeridian } from './geography'

describe('coordinatesToSurfacePoint', () => {
  it('keeps the prime meridian on the positive X axis and east on positive Z', () => {
    expect(coordinatesToSurfacePoint({ latitude: 0, longitude: 0 }, 2)).toEqual(new Vector3(2, 0, 0))
    expect(coordinatesToSurfacePoint({ latitude: 0, longitude: 90 }, 2).x).toBeCloseTo(0)
    expect(coordinatesToSurfacePoint({ latitude: 0, longitude: 90 }, 2).z).toBeCloseTo(2)
  })
})

describe('splitLineAtAntimeridian', () => {
  it('keeps a geographic border from drawing across the globe at the date line', () => {
    expect(splitLineAtAntimeridian([[170, 10], [-170, 11], [-160, 12]])).toEqual([
      [[170, 10]],
      [[-170, 11], [-160, 12]],
    ])
  })
})

describe('minimumMoonDistance', () => {
  it('keeps the illustrated Moon fully clear of the Earth at every sampled orbital position', () => {
    const earthRadius = 1.8
    const moonRadius = 0.2

    expect(minimumMoonDistance(earthRadius, 200)).toBeGreaterThan(earthRadius + moonRadius)
  })
})
