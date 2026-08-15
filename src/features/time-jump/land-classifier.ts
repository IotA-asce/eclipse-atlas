import type { ObserverLocation } from '../eclipse/types'

type Position = [number, number]
type Polygon = Position[][]
export interface LandCollection { features: Array<{ geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: Polygon | Polygon[] } }> }

const insideRing = ([longitude, latitude]: Position, ring: Position[]) => {
  let inside = false
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const [x1, y1] = ring[index]
    const [x2, y2] = ring[previous]
    if ((y1 > latitude) !== (y2 > latitude) && longitude < (x2 - x1) * (latitude - y1) / (y2 - y1) + x1) inside = !inside
  }
  return inside
}

const insidePolygon = (point: Position, polygon: Polygon) => insideRing(point, polygon[0]) && !polygon.slice(1).some((ring) => insideRing(point, ring))

export const isLocationOnLand = (location: ObserverLocation, land: LandCollection) => land.features.some(({ geometry }) => {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates as Polygon] : geometry.coordinates as Polygon[]
  return polygons.some((polygon) => insidePolygon([location.longitude, location.latitude], polygon))
})
