import { SRGBColorSpace, type Texture } from 'three'

/**
 * NASA's equirectangular image puts the prime meridian in its horizontal
 * centre, which matches SphereGeometry's UV layout and this app's local axes:
 * X is 0° longitude and positive Z is east. Do not mirror this texture.
 */
export const configureEarthMapTexture = (texture: Texture) => {
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true

  return texture
}
