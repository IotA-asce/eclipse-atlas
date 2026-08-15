import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import type { LocalSolarEclipse } from '../features/eclipse/types'
import App from './App'

const { findNextLocalSolarEclipse } = vi.hoisted(() => ({ findNextLocalSolarEclipse: vi.fn() }))

vi.mock('../components/GlobeScene', () => ({
  GlobeScene: ({ onSelectCoordinates }: { onSelectCoordinates: (coordinates: { latitude: number; longitude: number }) => void }) => (
    <button type="button" onClick={() => onSelectCoordinates({ latitude: 40.7128, longitude: -74.006 })}>
      Select New York
    </button>
  ),
}))

vi.mock('../features/eclipse/eclipse-service', () => ({ findNextLocalSolarEclipse }))

const eclipse: LocalSolarEclipse = {
  kind: 'Partial',
  obscuration: 0.7423,
  partialPhase: {
    begin: { time: new Date('2026-08-12T16:16:00.000Z'), sunAltitudeDegrees: 42 },
    end: { time: new Date('2026-08-12T18:31:00.000Z'), sunAltitudeDegrees: 38 },
  },
  peak: { time: new Date('2026-08-12T17:24:00.000Z'), sunAltitudeDegrees: 45 },
}

it('calculates and displays an eclipse when the globe selects coordinates', () => {
  findNextLocalSolarEclipse.mockReturnValue(eclipse)
  render(<App />)

  fireEvent.click(screen.getByRole('button', { name: 'Select New York' }))

  expect(findNextLocalSolarEclipse).toHaveBeenCalledWith({ latitude: 40.7128, longitude: -74.006 })
  expect(screen.getByRole('region', { name: 'Next visible solar eclipse' })).toBeVisible()
})
