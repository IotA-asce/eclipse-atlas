/** A point on Earth used for an eclipse calculation. */
export interface ObserverLocation {
  /** Degrees north of the equator, in the inclusive range -90 to 90. */
  latitude: number
  /** Degrees east of Greenwich, in the inclusive range -180 to 180. */
  longitude: number
  /** Elevation above mean sea level, expressed in meters. Defaults to zero. */
  elevationMeters?: number
}

export type LocalSolarEclipseKind = 'Partial' | 'Annular' | 'Total'

/** A local eclipse contact time and the refracted altitude of the Sun in degrees. */
export interface EclipsePhase {
  time: Date
  sunAltitudeDegrees: number
}

/**
 * Eclipse circumstances calculated for one observer.
 *
 * `obscuration` is the fraction of the Sun's apparent disc area covered at peak.
 * A central phase is present only for annular and total eclipses.
 */
export interface LocalSolarEclipse {
  kind: LocalSolarEclipseKind
  obscuration: number
  partialPhase: {
    begin: EclipsePhase
    end: EclipsePhase
  }
  peak: EclipsePhase
  centralPhase?: {
    begin: EclipsePhase
    end: EclipsePhase
  }
}
