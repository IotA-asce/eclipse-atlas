import { expect, it } from 'vitest'
import { confineToDeck } from './deck-collision'

const deck = { halfWidth: 3, halfLength: 8, deckHeight: 1 }

it('keeps the observer within rails and moves them outside cabin collision', () => {
  expect(confineToDeck({ x: 8, z: -12 }, deck, [])).toEqual({ x: 2.55, z: -7.55 })
  const blocked = confineToDeck({ x: 0, z: 0 }, deck, [{ minX: -1, maxX: 1, minZ: -2, maxZ: 2 }])
  expect(blocked.x < -1 || blocked.x > 1 || blocked.z < -2 || blocked.z > 2).toBe(true)
})
