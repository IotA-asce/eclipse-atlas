import { Vector3 } from 'three'
import type { Coordinates } from '../features/eclipse/coordinates'

export type LongitudeLatitude = readonly [longitude: number, latitude: number]

export const coordinatesToSurfacePoint = ({ latitude, longitude }: Coordinates, radius: number) => {
  const latitudeRadians = (latitude * Math.PI) / 180
  // Three's SphereGeometry UVs run opposite geographic east for an unmirrored map.
  const longitudeRadians = longitude === 0 ? 0 : (-longitude * Math.PI) / 180
  const horizontalRadius = radius * Math.cos(latitudeRadians)

  return new Vector3(
    horizontalRadius * Math.cos(longitudeRadians),
    radius * Math.sin(latitudeRadians),
    horizontalRadius * Math.sin(longitudeRadians),
  )
}

/** Splits data lines at the antimeridian instead of drawing a false chord across Earth. */
export const splitLineAtAntimeridian = (line: readonly LongitudeLatitude[]) => {
  const segments: LongitudeLatitude[][] = []
  let segment: LongitudeLatitude[] = []

  for (const point of line) {
    const previous = segment.at(-1)
    if (previous && Math.abs(point[0] - previous[0]) > 180) {
      segments.push(segment)
      segment = []
    }
    segment.push(point)
  }

  if (segment.length > 0) segments.push(segment)
  return segments
}

const moonPosition = (earthRadius: number, elapsedSeconds: number) => {
  const angle = elapsedSeconds * 0.16
  return new Vector3(
    Math.cos(angle) * (earthRadius + 1.2),
    Math.sin(angle * 1.8) * 0.42,
    Math.sin(angle) * (earthRadius + 0.9),
  )
}

export const moonPositionAt = (earthRadius: number, elapsedSeconds: number) => moonPosition(earthRadius, elapsedSeconds)

export const minimumMoonDistance = (earthRadius: number, samples: number) => {
  let minimum = Number.POSITIVE_INFINITY
  for (let index = 0; index < samples; index += 1) {
    minimum = Math.min(minimum, moonPosition(earthRadius, (index / samples) * (Math.PI * 2) / 0.16).length())
  }
  return minimum
}
