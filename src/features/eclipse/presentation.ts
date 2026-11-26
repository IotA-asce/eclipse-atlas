import type { LocalSolarEclipse, ObserverLocation } from './types'

export interface PresentationOptions {
  locale?: string
  timeZone?: string
}

export interface PresentedEclipse {
  coordinates: string
  type: string
  peak: string
  timeZone: string
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
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...(timeZone ? { timeZone } : {}),
  })
  const centralPhase = eclipse.centralPhase
    ? {
        label: eclipse.kind === 'Annular' ? ('Annular phase' as const) : ('Total phase' as const),
        begin: timeFormatter.format(eclipse.centralPhase.begin.time),
        end: timeFormatter.format(eclipse.centralPhase.end.time),
      }
    : undefined

  return {
    coordinates: `${formatCoordinate(location.latitude, 'N', 'S', locale)}, ${formatCoordinate(location.longitude, 'E', 'W', locale)}`,
    type: `${eclipse.kind} solar eclipse`,
    peak: timeFormatter.format(eclipse.peak.time),
    timeZone: timeFormatter.resolvedOptions().timeZone,
    coverage: new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    }).format(eclipse.obscuration),
    partialPhase: {
      label: 'Partial phase',
      begin: timeFormatter.format(eclipse.partialPhase.begin.time),
      end: timeFormatter.format(eclipse.partialPhase.end.time),
    },
    ...(centralPhase ? { centralPhase } : {}),
  }
}
