import type { DeckBounds, DeckObstacle } from './deck-collision'

export const vesselTypes = ['Sailboat', 'Fishing trawler', 'Cargo ship', 'Cruise ship'] as const
export type VesselType = typeof vesselTypes[number]

export interface VesselSpec {
  model: string
  scale: number
  waterlineClearance: number
  deck: DeckBounds
  obstacles: DeckObstacle[]
}

export const vesselSpecs: Record<VesselType, VesselSpec> = {
  Sailboat: { model: '/models/kenney-watercraft/sailboat.glb', scale: 2.1, waterlineClearance: 0.72, deck: { halfWidth: 1.5, halfLength: 3.4, deckHeight: 1.05 }, obstacles: [{ minX: -0.5, maxX: 0.5, minZ: -0.55, maxZ: 0.95 }] },
  'Fishing trawler': { model: '/models/kenney-watercraft/fishing-trawler.glb', scale: 2.65, waterlineClearance: 0.76, deck: { halfWidth: 2, halfLength: 4.45, deckHeight: 1.16 }, obstacles: [{ minX: -1.15, maxX: 1.15, minZ: 0.2, maxZ: 2.25 }] },
  'Cargo ship': { model: '/models/kenney-watercraft/cargo-ship.glb', scale: 1.35, waterlineClearance: 0.82, deck: { halfWidth: 2.25, halfLength: 6.45, deckHeight: 1.4 }, obstacles: [{ minX: -1.8, maxX: 1.8, minZ: -2.6, maxZ: 3.9 }] },
  'Cruise ship': { model: '/models/kenney-watercraft/cruise-ship.glb', scale: 0.86, waterlineClearance: 0.9, deck: { halfWidth: 1.35, halfLength: 6.6, deckHeight: 1.24 }, obstacles: [{ minX: -1.05, maxX: 1.05, minZ: -3.8, maxZ: 4.1 }] },
}
