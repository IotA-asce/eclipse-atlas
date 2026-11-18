import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { TimeJumpBoundary, TimeJumpLoadState } from './DeferredTimeJump'

it('allows returning to the globe while the observer view loads', () => {
  const onExit = vi.fn()
  render(<TimeJumpLoadState onExit={onExit} />)
  expect(screen.getByRole('status')).toHaveTextContent('Loading eclipse view')
  fireEvent.click(screen.getByRole('button', { name: 'Back to globe' }))
  expect(onExit).toHaveBeenCalledOnce()
})

it('contains a view failure and offers a return instead of a blank screen', () => {
  const onExit = vi.fn()
  const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
  const BrokenView = () => { throw new Error('Observer module unavailable') }
  try {
    render(<TimeJumpBoundary onExit={onExit}><BrokenView /></TimeJumpBoundary>)
    expect(screen.getByRole('alert')).toHaveTextContent('Your observing point and eclipse result remain available')
    fireEvent.click(screen.getByRole('button', { name: 'Back to globe' }))
    expect(onExit).toHaveBeenCalledOnce()
  } finally {
    errorLog.mockRestore()
  }
})
