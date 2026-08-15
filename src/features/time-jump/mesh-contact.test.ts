import { expect, it } from 'vitest'
import { clipMovementAtContact } from './mesh-contact'

it('clips a requested walking path before a rendered-model contact', () => {
  expect(clipMovementAtContact({ x: 0, z: 0 }, { x: 0, z: 4 }, 2).z).toBeCloseTo(1.64)
  expect(clipMovementAtContact({ x: 0, z: 0 }, { x: 1, z: 0 }, undefined)).toEqual({ x: 1, z: 0 })
})
