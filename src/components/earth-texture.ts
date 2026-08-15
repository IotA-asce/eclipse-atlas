import { RepeatWrapping, SRGBColorSpace, type Texture } from 'three'

/**
 * Natural equirectangular maps put 0° longitude in their horizontal centre.
 * SphereGeometry's positive Z axis is east in Eclipse Atlas, so its UVs need
 * a horizontal mirror to preserve the coordinate convention used for picking.
 */
export const configureEarthMapTexture = (texture: Texture) => {
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.repeat.x = -1
  texture.offset.x = 1
  texture.needsUpdate = true

  return texture
}
