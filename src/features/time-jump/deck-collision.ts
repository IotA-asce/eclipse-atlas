export interface DeckBounds { halfWidth: number; halfLength: number; deckHeight: number }
export interface DeckObstacle { minX: number; maxX: number; minZ: number; maxZ: number }
export interface DeckPosition { x: number; z: number }

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const confineToDeck = (position: DeckPosition, bounds: DeckBounds, obstacles: DeckObstacle[], margin = 0.45): DeckPosition => {
  const confined = {
    x: clamp(position.x, -bounds.halfWidth + margin, bounds.halfWidth - margin),
    z: clamp(position.z, -bounds.halfLength + margin, bounds.halfLength - margin),
  }
  for (const obstacle of obstacles) {
    if (confined.x <= obstacle.minX || confined.x >= obstacle.maxX || confined.z <= obstacle.minZ || confined.z >= obstacle.maxZ) continue
    const exits = [
      { distance: Math.abs(confined.x - obstacle.minX), position: { x: obstacle.minX - margin, z: confined.z } },
      { distance: Math.abs(obstacle.maxX - confined.x), position: { x: obstacle.maxX + margin, z: confined.z } },
      { distance: Math.abs(confined.z - obstacle.minZ), position: { x: confined.x, z: obstacle.minZ - margin } },
      { distance: Math.abs(obstacle.maxZ - confined.z), position: { x: confined.x, z: obstacle.maxZ + margin } },
    ]
    const closest = exits.reduce((best, candidate) => candidate.distance < best.distance ? candidate : best)
    confined.x = clamp(closest.position.x, -bounds.halfWidth + margin, bounds.halfWidth - margin)
    confined.z = clamp(closest.position.z, -bounds.halfLength + margin, bounds.halfLength - margin)
  }
  return confined
}
