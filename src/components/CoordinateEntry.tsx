import { useId, useRef, useState, type FormEvent } from 'react'
import type { Coordinates } from '../features/eclipse/coordinates'

// Number('') and Number('0x10') are valid JavaScript, but not coordinate entry.
const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i
const coordinate = (text: FormDataEntryValue | null, limit: number) => {
  const value = typeof text === 'string' ? text.trim() : ''
  const number = decimal.test(value) ? Number(value) : NaN
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : undefined
}

export const CoordinateEntry = ({ selectedCoordinates, onSelectCoordinates }: {
  selectedCoordinates?: Coordinates
  onSelectCoordinates: (coordinates: Coordinates) => void
}) => {
  const id = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const latitude = useRef<HTMLInputElement>(null)
  const longitude = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState({ latitude: false, longitude: false })

  const open = () => {
    setErrors({ latitude: false, longitude: false })
    // Refresh on each opening, including after a globe click or cancelled edit.
    if (latitude.current) latitude.current.value = selectedCoordinates?.latitude.toString() ?? ''
    if (longitude.current) longitude.current.value = selectedCoordinates?.longitude.toString() ?? ''
    dialog.current?.showModal()
    latitude.current?.focus()
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const lat = coordinate(data.get('latitude'), 90)
    const lon = coordinate(data.get('longitude'), 180)
    setErrors({ latitude: lat === undefined, longitude: lon === undefined })
    if (lat === undefined || lon === undefined) {
      const invalidInput = lat === undefined ? latitude.current : longitude.current
      invalidInput?.focus()
      return
    }
    dialog.current?.close()
    onSelectCoordinates({ latitude: lat, longitude: lon })
  }

  return (
    <div className="coordinate-entry">
      <button ref={trigger} className="coordinate-entry__trigger" type="button" aria-haspopup="dialog" aria-controls={`${id}-dialog`} onClick={open}>Enter coordinates</button>
      <dialog ref={dialog} id={`${id}-dialog`} className="coordinate-dialog" aria-labelledby={`${id}-heading`} onClose={() => trigger.current?.focus()}>
        <form noValidate onSubmit={submit}>
          <p className="eyebrow">Your observing point</p>
          <h2 id={`${id}-heading`}>Choose observing coordinates</h2>
          <p id={`${id}-hint`}>Use decimal degrees. North and east are positive; south and west are negative.</p>
          <label htmlFor={`${id}-latitude`}>Latitude (° north)</label>
          <input ref={latitude} id={`${id}-latitude`} name="latitude" type="text" required
            aria-invalid={errors.latitude} aria-describedby={`${id}-hint${errors.latitude ? ` ${id}-error` : ''}`} />
          <label htmlFor={`${id}-longitude`}>Longitude (° east)</label>
          <input ref={longitude} id={`${id}-longitude`} name="longitude" type="text" required
            aria-invalid={errors.longitude} aria-describedby={`${id}-hint${errors.longitude ? ` ${id}-error` : ''}`} />
          {errors.latitude || errors.longitude ? <p id={`${id}-error`} className="coordinate-dialog__error" role="alert">
            {errors.latitude ? 'Latitude must be a decimal number from −90 to 90. ' : ''}
            {errors.longitude ? 'Longitude must be a decimal number from −180 to 180.' : ''}
          </p> : null}
          <div className="coordinate-dialog__actions">
            <button className="retry-button" type="submit">Choose this point</button>
            <button className="coordinate-entry__trigger" type="button" onClick={() => dialog.current?.close()}>Cancel</button>
          </div>
        </form>
      </dialog>
    </div>
  )
}
