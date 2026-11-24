import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { CoordinateEntry } from './CoordinateEntry'

function submit(latitude: string, longitude: string) {
  fireEvent.click(screen.getByRole('button', { name: 'Enter coordinates' }))
  fireEvent.change(screen.getByLabelText('Latitude (° north)'), { target: { value: latitude } })
  fireEvent.change(screen.getByLabelText('Longitude (° east)'), { target: { value: longitude } })
  fireEvent.click(screen.getByRole('button', { name: 'Choose this point' }))
}

it.each([
  ['40.7128', '-74.006', 40.7128, -74.006],
  ['0', '0', 0, 0],
  ['90', '-180', 90, -180],
  ['-90', '180', -90, 180],
])('selects valid decimal coordinates %s, %s', (latitude, longitude, lat, lon) => {
  const select = vi.fn()
  render(<CoordinateEntry onSelectCoordinates={select} />)
  submit(latitude, longitude)
  expect(select).toHaveBeenCalledWith({ latitude: lat, longitude: lon })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Enter coordinates' })).toHaveFocus()
})

it.each([
  ['', '0', 'Latitude (° north)'],
  ['Infinity', '0', 'Latitude (° north)'],
  ['0x10', '0', 'Latitude (° north)'],
  ['1e999', '0', 'Latitude (° north)'],
  ['90.1', '0', 'Latitude (° north)'],
  ['0', '180.1', 'Longitude (° east)'],
  ['0', 'NaN', 'Longitude (° east)'],
])('rejects invalid coordinates %s, %s without selecting', (latitude, longitude, firstInvalid) => {
  const select = vi.fn()
  render(<CoordinateEntry onSelectCoordinates={select} />)
  submit(latitude, longitude)
  expect(select).not.toHaveBeenCalled()
  expect(screen.getByRole('alert')).toBeVisible()
  expect(screen.getByLabelText(firstInvalid)).toHaveAttribute('aria-invalid', 'true')
  expect(screen.getByLabelText(firstInvalid)).toHaveFocus()
  expect(screen.getByRole('dialog')).toBeVisible()
})

it('cancels without selecting and refreshes defaults from the current selected point', () => {
  const select = vi.fn()
  const { rerender } = render(<CoordinateEntry onSelectCoordinates={select} selectedCoordinates={{ latitude: 1, longitude: 2 }} />)
  fireEvent.click(screen.getByRole('button', { name: 'Enter coordinates' }))
  expect(screen.getByLabelText('Latitude (° north)')).toHaveValue('1')
  fireEvent.change(screen.getByLabelText('Latitude (° north)'), { target: { value: '3' } })
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(select).not.toHaveBeenCalled()
  rerender(<CoordinateEntry onSelectCoordinates={select} selectedCoordinates={{ latitude: -4, longitude: 5 }} />)
  fireEvent.click(screen.getByRole('button', { name: 'Enter coordinates' }))
  expect(screen.getByLabelText('Latitude (° north)')).toHaveValue('-4')
  expect(screen.getByLabelText('Longitude (° east)')).toHaveValue('5')
})
