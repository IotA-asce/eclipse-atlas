import { describe, expect, it } from 'vitest'
import { presentEclipse } from './presentation'
import type { LocalSolarEclipse, ObserverLocation } from './types'

const location: ObserverLocation = {
  latitude: 40.7128,
  longitude: -74.006,
}

const partialEclipse: LocalSolarEclipse = {
  kind: 'Partial',
  obscuration: 0.7423,
  partialPhase: {
    begin: { time: new Date('2026-08-12T16:16:00.000Z'), sunAltitudeDegrees: 42 },
    end: { time: new Date('2026-08-12T18:31:00.000Z'), sunAltitudeDegrees: 38 },
  },
  peak: { time: new Date('2026-08-12T17:24:00.000Z'), sunAltitudeDegrees: 45 },
}

describe('presentEclipse', () => {
  it('formats the peak in the injected timezone', () => {
    const result = presentEclipse(partialEclipse, location, {
      locale: 'en-US',
      timeZone: 'America/New_York',
    })

    expect(result.peak).toBe('Aug 12, 2026, 1:24 PM')
  })

  it('does not create a central-phase label for a partial eclipse', () => {
    const result = presentEclipse(partialEclipse, location, {
      locale: 'en-US',
      timeZone: 'UTC',
    })

    expect(result.centralPhase).toBeUndefined()
  })

  it('formats coordinates and obscuration for people, not calculation code', () => {
    const result = presentEclipse(partialEclipse, location, {
      locale: 'en-US',
      timeZone: 'UTC',
    })

    expect(result.coordinates).toBe('40.71° N, 74.01° W')
    expect(result.coverage).toBe('74.2%')
  })
})
