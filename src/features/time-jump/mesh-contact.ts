export interface ContactPoint { x: number; z: number }

export const clipMovementAtContact = (start: ContactPoint, wanted: ContactPoint, hitDistance: number | undefined, radius = 0.36): ContactPoint => {
  if (hitDistance === undefined) return wanted
  const dx = wanted.x - start.x
  const dz = wanted.z - start.z
  const distance = Math.hypot(dx, dz)
  if (distance === 0 || hitDistance >= distance) return wanted
  const scale = Math.max(0, hitDistance - radius) / distance
  return { x: start.x + dx * scale, z: start.z + dz * scale }
}
