import { SRGBColorSpace, Texture } from 'three'
import { expect, it } from 'vitest'
import { configureEarthMapTexture } from './earth-texture'

it('uses sRGB without mirroring the standard equirectangular map', () => {
  const texture = configureEarthMapTexture(new Texture())

  expect(texture.colorSpace).toBe(SRGBColorSpace)
  expect(texture.repeat.x).toBe(1)
  expect(texture.offset.x).toBe(0)
})
