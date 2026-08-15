import { describe, expect, it } from 'vitest'
import { findNextLocalSolarEclipse } from './eclipse-service'

const january2026 = new Date('2026-01-01T00:00:00.000Z')

const expectWithinMinutes = (actual: Date, expected: string, minutes: number) => {
  const differenceMs = Math.abs(actual.getTime() - new Date(expected).getTime())
  expect(differenceMs).toBeLessThanOrEqual(minutes * 60_000)
}

describe('findNextLocalSolarEclipse', () => {
  it('returns the next local eclipse with peak and obscuration', () => {
    const result = findNextLocalSolarEclipse(
      { latitude: 40.7128, longitude: -74.006, elevationMeters: 10 },
      january2026,
    )

    expect(result.kind).toMatch(/Partial|Annular|Total/)
    expect(result.peak.time).toBeInstanceOf(Date)
    expect(result.obscuration).toBeGreaterThan(0)
  })

  it('matches NASA local circumstances for New York', () => {
    // NASA/GSFC catalog: local-standard peak 12:54, plus EDT = 17:54 UTC.
    // https://eclipse.gsfc.nasa.gov/SEcirc/SEcircNA/NewYorkNY1%2B21.html
    const result = findNextLocalSolarEclipse(
      { latitude: 40.7128, longitude: -74.006, elevationMeters: 10 },
      january2026,
    )

    expect(result.kind).toBe('Partial')
    expectWithinMinutes(result.peak.time, '2026-08-12T17:54:00.000Z', 2)
  })

  it('returns the total eclipse visible from Reykjavík', () => {
    // TODO(eclipse-validation): NASA's published 2026 path material confirms the
    // eclipse and its ephemeris, but no city-specific Reykjavík circumstances table
    // was located. Add a primary-source peak-time assertion when one is available.
    // https://eclipse.gsfc.nasa.gov/SEpath/SEpath2001/SE2026Aug12Tpath.html
    const result = findNextLocalSolarEclipse(
      { latitude: 64.1466, longitude: -21.9426, elevationMeters: 20 },
      january2026,
    )

    expect(result.kind).toBe('Total')
    expect(result.centralPhase).toBeDefined()
  })

  it('matches NASA local circumstances for Sydney', () => {
    // NASA/GSFC catalog: local-standard peak 14:01 (GMT+10) = 04:01 UTC.
    // https://eclipse.gsfc.nasa.gov/SEcirc/SEcircAU/SydneyAUS1%2B21.html
    const result = findNextLocalSolarEclipse(
      { latitude: -33.8688, longitude: 151.2093, elevationMeters: 58 },
      january2026,
    )

    expect(result.kind).toBe('Total')
    expectWithinMinutes(result.peak.time, '2028-07-22T04:01:00.000Z', 2)
  })
})
