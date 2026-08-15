import { expect, it } from 'vitest'
import { vesselSpecs, vesselTypes } from './vessel-types'

it('defines a model and walkable collision deck for every vessel', () => {
  vesselTypes.forEach((type) => {
    const spec = vesselSpecs[type]
    expect(spec.model).toMatch(/^\/models\/kenney-watercraft\/.*\.glb$/)
    expect(spec.deck.halfWidth).toBeGreaterThan(0)
    expect(spec.deck.halfLength).toBeGreaterThan(0)
  })
})
