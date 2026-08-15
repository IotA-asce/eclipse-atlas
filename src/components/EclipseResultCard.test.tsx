import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { EclipseResultCard } from './EclipseResultCard'
import type { LocalSolarEclipse, ObserverLocation } from '../features/eclipse/types'

const location: ObserverLocation = {
  latitude: 40.7128,
  longitude: -74.006,
}

const eclipse: LocalSolarEclipse = {
  kind: 'Partial',
  obscuration: 0.7423,
  partialPhase: {
    begin: { time: new Date('2026-08-12T16:16:00.000Z'), sunAltitudeDegrees: 42 },
    end: { time: new Date('2026-08-12T18:31:00.000Z'), sunAltitudeDegrees: 38 },
  },
  peak: { time: new Date('2026-08-12T17:24:00.000Z'), sunAltitudeDegrees: 45 },
}

it('renders a named semantic result section with readable eclipse circumstances', () => {
  render(
    <EclipseResultCard
      eclipse={eclipse}
      location={location}
      locale="en-US"
      timeZone="America/New_York"
    />,
  )

  expect(screen.getByRole('region', { name: 'Next visible solar eclipse' })).toBeVisible()
  expect(screen.getByText('Partial solar eclipse')).toBeVisible()
  expect(screen.getByText('Aug 12, 2026, 1:24 PM')).toBeVisible()
  expect(screen.getByText('74.2%')).toBeVisible()
  expect(screen.getByText('Visualization is not to scale.')).toBeVisible()
  expect(screen.queryByText('Central phase')).not.toBeInTheDocument()
})

it('labels a total eclipse central phase without relying on its visual treatment', () => {
  render(
    <EclipseResultCard
      eclipse={{
        ...eclipse,
        kind: 'Total',
        centralPhase: {
          begin: { time: new Date('2026-08-12T17:22:00.000Z'), sunAltitudeDegrees: 45 },
          end: { time: new Date('2026-08-12T17:26:00.000Z'), sunAltitudeDegrees: 45 },
        },
      }}
      location={location}
      locale="en-US"
      timeZone="America/New_York"
    />,
  )

  expect(screen.getByText('Total phase')).toBeVisible()
  expect(screen.getByText(/Begins Aug 12, 2026, 1:22 PM/)).toBeVisible()
})
