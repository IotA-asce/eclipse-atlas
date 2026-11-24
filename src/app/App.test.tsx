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

vi.mock('../components/EclipseTimeJump', () => ({
  EclipseTimeJump: ({ onExit }: { onExit: () => void }) => (
    <main aria-label="Eclipse time jump simulation">
      <button type="button" onClick={onExit}>Exit simulation</button>
    </main>
  ),
}))

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

it('preserves the selected point and offers a retry when calculation fails', () => {
  findNextLocalSolarEclipse.mockImplementationOnce(() => {
    throw new Error('Calculation unavailable')
  }).mockReturnValueOnce(eclipse)
  render(<App />)

  fireEvent.click(screen.getByRole('button', { name: 'Select New York' }))
  expect(screen.getByRole('alert')).toHaveTextContent('We could not read this horizon')

  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  expect(screen.getByRole('region', { name: 'Next visible solar eclipse' })).toBeVisible()
})

it('opens the deferred observer view and retains the selected result on exit', async () => {
  findNextLocalSolarEclipse.mockReturnValue(eclipse)
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Select New York' }))
  const result = screen.getByRole('region', { name: 'Next visible solar eclipse' }).textContent

  fireEvent.click(screen.getByRole('button', { name: 'Jump to eclipse' }))
  expect(await screen.findByRole('main', { name: 'Eclipse time jump simulation' })).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'Exit simulation' }))

  expect(screen.getByRole('region', { name: 'Next visible solar eclipse' })).toHaveTextContent(result!)
  expect(screen.getByRole('button', { name: 'Jump to eclipse' })).toBeVisible()
})

it('uses typed coordinates for calculation retry and retains them after Time Jump', async () => {
  findNextLocalSolarEclipse.mockClear()
  findNextLocalSolarEclipse.mockImplementationOnce(() => { throw new Error('fixture failure') }).mockReturnValue(eclipse)
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Enter coordinates' }))
  fireEvent.change(screen.getByLabelText('Latitude (° north)'), { target: { value: '-33.8688' } })
  fireEvent.change(screen.getByLabelText('Longitude (° east)'), { target: { value: '151.2093' } })
  fireEvent.click(screen.getByRole('button', { name: 'Choose this point' }))
  expect(findNextLocalSolarEclipse).toHaveBeenLastCalledWith({ latitude: -33.8688, longitude: 151.2093 })
  expect(screen.getByRole('alert')).toHaveTextContent('We could not read this horizon')
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  const result = screen.getByRole('region', { name: 'Next visible solar eclipse' }).textContent
  fireEvent.click(screen.getByRole('button', { name: 'Jump to eclipse' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Exit simulation' }))
  expect(screen.getByRole('region', { name: 'Next visible solar eclipse' })).toHaveTextContent(result!)
  fireEvent.click(screen.getByRole('button', { name: 'Enter coordinates' }))
  expect(screen.getByLabelText('Latitude (° north)')).toHaveValue('-33.8688')
  expect(screen.getByLabelText('Longitude (° east)')).toHaveValue('151.2093')
})

it('keeps a globe-selected result when coordinate validation fails', () => {
  findNextLocalSolarEclipse.mockReturnValue(eclipse)
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: 'Select New York' }))
  const result = screen.getByRole('region', { name: 'Next visible solar eclipse' }).textContent
  findNextLocalSolarEclipse.mockClear()
  fireEvent.click(screen.getByRole('button', { name: 'Enter coordinates' }))
  expect(screen.getByLabelText('Latitude (° north)')).toHaveValue('40.7128')
  expect(screen.getByLabelText('Longitude (° east)')).toHaveValue('-74.006')
  fireEvent.change(screen.getByLabelText('Latitude (° north)'), { target: { value: '91' } })
  fireEvent.click(screen.getByRole('button', { name: 'Choose this point' }))
  expect(findNextLocalSolarEclipse).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(screen.getByRole('region', { name: 'Next visible solar eclipse' })).toHaveTextContent(result!)
})
