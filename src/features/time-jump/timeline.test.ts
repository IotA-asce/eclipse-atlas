import { expect, it } from 'vitest'
import { createEclipseTimeline, eclipseCoverageAt } from './timeline'
import type { LocalSolarEclipse } from '../eclipse/types'

const eclipse: LocalSolarEclipse = { kind: 'Total', obscuration: 1, partialPhase: { begin: { time: new Date('2027-01-01T10:00:00Z'), sunAltitudeDegrees: 25 }, end: { time: new Date('2027-01-01T12:00:00Z'), sunAltitudeDegrees: 30 } }, peak: { time: new Date('2027-01-01T11:00:00Z'), sunAltitudeDegrees: 40 } }

it('begins two minutes before first contact and reaches calculated peak coverage', () => {
  const timeline = createEclipseTimeline(eclipse)
  expect(timeline.start).toEqual(new Date('2027-01-01T09:58:00Z'))
  expect(eclipseCoverageAt(eclipse, eclipse.peak.time)).toBe(1)
})
