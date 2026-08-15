export const vesselTypes = ['Sailboat', 'Fishing trawler', 'Cargo ship', 'Cruise ship'] as const
export type VesselType = typeof vesselTypes[number]
