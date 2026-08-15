import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { EclipseTimeJump } from './EclipseTimeJump'

vi.mock('@react-three/fiber', () => ({ Canvas: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, useThree: () => ({ camera: { position: { set: vi.fn() }, lookAt: vi.fn() } }) }))

it('offers real-time playback, acceleration, and immediate exit', () => {
  render(<EclipseTimeJump location={{ latitude: 0, longitude: 0 }} eclipse={{ kind: 'Partial', obscuration: 0.5, partialPhase: { begin: { time: new Date('2027-01-01T10:00:00Z'), sunAltitudeDegrees: 20 }, end: { time: new Date('2027-01-01T12:00:00Z'), sunAltitudeDegrees: 25 } }, peak: { time: new Date('2027-01-01T11:00:00Z'), sunAltitudeDegrees: 40 } }} onExit={vi.fn()} />)
  expect(screen.getByRole('button', { name: '1×' })).toHaveClass('is-active')
  expect(screen.getByRole('button', { name: '300×' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Exit simulation' })).toBeInTheDocument()
})
