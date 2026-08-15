import { RepeatWrapping, SRGBColorSpace, Texture } from 'three'
import { expect, it } from 'vitest'
import { configureEarthMapTexture } from './earth-texture'

it('uses sRGB and mirrors an equirectangular map to preserve east-positive longitude', () => {
  const texture = configureEarthMapTexture(new Texture())

  expect(texture.colorSpace).toBe(SRGBColorSpace)
  expect(texture.wrapS).toBe(RepeatWrapping)
  expect(texture.repeat.x).toBe(-1)
  expect(texture.offset.x).toBe(1)
})
