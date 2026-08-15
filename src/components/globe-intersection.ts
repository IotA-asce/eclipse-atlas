import { Vector3 } from 'three'
import { pointToCoordinates, type Coordinates } from '../features/eclipse/coordinates'

interface EarthIntersection {
  worldToLocal: (point: Vector3) => Vector3
}

/** Converts the canvas event's world-space raycast point into Earth mesh-local coordinates. */
export const coordinatesFromEarthIntersection = (earth: EarthIntersection, point: Vector3): Coordinates =>
  pointToCoordinates(earth.worldToLocal(point.clone()))
