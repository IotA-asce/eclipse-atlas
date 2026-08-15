export interface GlobePoint {
  x: number
  y: number
  z: number
}

export interface Coordinates {
  latitude: number
  longitude: number
}

const radiansToDegrees = (radians: number) => radians * (180 / Math.PI)

/**
 * Converts an Earth mesh-local point into geographic coordinates.
 *
 * The globe uses Y as north, X as longitude 0°, and positive Z as east.
 * Inputs are normalized so intersections from a scaled sphere produce the
 * same coordinates as points on the unit sphere.
 */
export const pointToCoordinates = ({ x, y, z }: GlobePoint): Coordinates => {
  const magnitude = Math.hypot(x, y, z)

  if (magnitude === 0) {
    throw new RangeError('Cannot derive coordinates from the globe center.')
  }

  const normalizedX = x / magnitude
  const normalizedY = y / magnitude
  const normalizedZ = z / magnitude

  return {
    latitude: radiansToDegrees(Math.asin(normalizedY)),
    longitude: radiansToDegrees(Math.atan2(normalizedZ, normalizedX)),
  }
}
