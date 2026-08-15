import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { Vector3 } from 'three'
import { expect, it, vi } from 'vitest'
import { coordinatesFromEarthIntersection } from './globe-intersection'
import { GlobeScene } from './GlobeScene'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="globe-canvas">{children}</div>,
}))

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
}))

it('converts a known canvas intersection into a selected geographic point', () => {
  const earth = {
    worldToLocal: (point: Vector3) => point,
  }

  render(<GlobeScene onSelectCoordinates={vi.fn()} />)

  expect(coordinatesFromEarthIntersection(earth, new Vector3(0, 1, 0))).toEqual({ latitude: 90, longitude: 0 })
  expect(screen.getByTestId('globe-canvas')).toBeInTheDocument()
})

it('renders a non-interactive pin for an already selected location', () => {
  render(
    <GlobeScene
      onSelectCoordinates={vi.fn()}
      selectedCoordinates={{ latitude: -33.8688, longitude: 151.2093 }}
    />,
  )

  expect(screen.getByTestId('selected-location-pin')).not.toHaveAttribute('tabindex')
})
