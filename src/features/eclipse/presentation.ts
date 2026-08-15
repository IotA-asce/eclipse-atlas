import type { LocalSolarEclipse, ObserverLocation } from './types'

export interface PresentationOptions {
  locale?: string
  timeZone?: string
}

export interface PresentedEclipse {
  coordinates: string
  type: string
  peak: string
  coverage: string
  partialPhase: {
    label: 'Partial phase'
    begin: string
    end: string
  }
  centralPhase?: {
    label: 'Annular phase' | 'Total phase'
    begin: string
    end: string
  }
}

const formatCoordinate = (value: number, positiveHemisphere: string, negativeHemisphere: string, locale: string) => {
  const hemisphere = value >= 0 ? positiveHemisphere : negativeHemisphere
  const magnitude = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Math.abs(value))

  return `${magnitude}° ${hemisphere}`
}

const formatTime = (time: Date, locale: string, timeZone: string | undefined) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...(timeZone ? { timeZone } : {}),
  }).format(time)

/**
 * Converts calculation-domain eclipse data into concise, locale-aware display copy.
 * The timezone is injectable so the UI can use the visitor's zone while tests stay
 * deterministic.
 */
export const presentEclipse = (
  eclipse: LocalSolarEclipse,
  location: ObserverLocation,
  { locale = 'en-US', timeZone }: PresentationOptions = {},
): PresentedEclipse => {
  const centralPhase = eclipse.centralPhase
    ? {
        label: eclipse.kind === 'Annular' ? ('Annular phase' as const) : ('Total phase' as const),
        begin: formatTime(eclipse.centralPhase.begin.time, locale, timeZone),
        end: formatTime(eclipse.centralPhase.end.time, locale, timeZone),
      }
    : undefined

  return {
    coordinates: `${formatCoordinate(location.latitude, 'N', 'S', locale)}, ${formatCoordinate(location.longitude, 'E', 'W', locale)}`,
    type: `${eclipse.kind} solar eclipse`,
    peak: formatTime(eclipse.peak.time, locale, timeZone),
    coverage: new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    }).format(eclipse.obscuration),
    partialPhase: {
      label: 'Partial phase',
      begin: formatTime(eclipse.partialPhase.begin.time, locale, timeZone),
      end: formatTime(eclipse.partialPhase.end.time, locale, timeZone),
    },
    ...(centralPhase ? { centralPhase } : {}),
  }
}
