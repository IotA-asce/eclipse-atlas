import { expect, it } from 'vitest'
import { pointToCoordinates } from './coordinates'

it('maps the top of a globe to the north pole', () => {
  expect(pointToCoordinates({ x: 0, y: 1, z: 0 })).toMatchObject({ latitude: 90 })
})

it('normalizes a point before calculating coordinates', () => {
  expect(pointToCoordinates({ x: 2, y: 0, z: 0 })).toEqual({ latitude: 0, longitude: 0 })
})

it('maps negative Z to geographic east for the unmirrored Earth texture', () => {
  expect(pointToCoordinates({ x: 0, y: 0, z: -1 })).toEqual({ latitude: 0, longitude: 90 })
})
