import * as Astronomy from 'astronomy-engine'
import type {
  EclipsePhase,
  LocalSolarEclipse,
  LocalSolarEclipseKind,
  ObserverLocation,
} from './types'

const MAX_ECLIPSE_SEARCHES = 100

const toPhase = (event: Astronomy.EclipseEvent): EclipsePhase => ({
  time: new Date(event.time.date),
  sunAltitudeDegrees: event.altitude,
})

const toKind = (kind: Astronomy.EclipseKind): LocalSolarEclipseKind => {
  switch (kind) {
    case Astronomy.EclipseKind.Partial:
      return 'Partial'
    case Astronomy.EclipseKind.Annular:
      return 'Annular'
    case Astronomy.EclipseKind.Total:
      return 'Total'
    default:
      throw new RangeError(`Unsupported local solar eclipse kind: ${kind}`)
  }
}

const isVisibleAboveHorizon = (eclipse: Astronomy.LocalSolarEclipseInfo) =>
  [eclipse.partial_begin, eclipse.peak, eclipse.partial_end].some(
    (event) => event.altitude > 0,
  )

const validateLocation = ({ latitude, longitude, elevationMeters = 0 }: ObserverLocation) => {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new RangeError('Latitude must be a finite number between -90 and 90 degrees.')
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new RangeError('Longitude must be a finite number between -180 and 180 degrees.')
  }

  if (!Number.isFinite(elevationMeters)) {
    throw new RangeError('Elevation must be a finite number of meters.')
  }

  return { latitude, longitude, elevationMeters }
}

const mapEclipse = (eclipse: Astronomy.LocalSolarEclipseInfo): LocalSolarEclipse => {
  const centralPhase =
    eclipse.total_begin && eclipse.total_end
      ? {
          begin: toPhase(eclipse.total_begin),
          end: toPhase(eclipse.total_end),
        }
      : undefined

  return {
    kind: toKind(eclipse.kind),
    obscuration: eclipse.obscuration,
    partialPhase: {
      begin: toPhase(eclipse.partial_begin),
      end: toPhase(eclipse.partial_end),
    },
    peak: toPhase(eclipse.peak),
    ...(centralPhase ? { centralPhase } : {}),
  }
}

/**
 * Finds the next solar eclipse whose partial phase is above the local horizon.
 *
 * Astronomy Engine may report a geometrically local eclipse while the Sun is below
 * the horizon. Those events are skipped so this boundary honors the product's
 * “visible from here” definition. The injected start date keeps calls deterministic.
 */
export const findNextLocalSolarEclipse = (
  location: ObserverLocation,
  startDate: Date = new Date(),
): LocalSolarEclipse => {
  if (Number.isNaN(startDate.getTime())) {
    throw new RangeError('Start date must be a valid Date.')
  }

  const { latitude, longitude, elevationMeters } = validateLocation(location)
  const observer = new Astronomy.Observer(latitude, longitude, elevationMeters)
  let eclipse = Astronomy.SearchLocalSolarEclipse(new Astronomy.AstroTime(startDate), observer)

  for (let searches = 0; searches < MAX_ECLIPSE_SEARCHES; searches += 1) {
    if (isVisibleAboveHorizon(eclipse)) {
      return mapEclipse(eclipse)
    }

    eclipse = Astronomy.NextLocalSolarEclipse(eclipse.peak.time, observer)
  }

  throw new Error('Could not find a locally visible solar eclipse within the search limit.')
}
