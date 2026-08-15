import { expect, it } from 'vitest'
import { isLocationOnLand, type LandCollection } from './land-classifier'

const land: LandCollection = { features: [{ geometry: { type: 'Polygon', coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]] } }] }
it('classifies points inside local polygons as land', () => {
  expect(isLocationOnLand({ latitude: 5, longitude: 5 }, land)).toBe(true)
  expect(isLocationOnLand({ latitude: 20, longitude: 20 }, land)).toBe(false)
})
