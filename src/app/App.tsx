import { useCallback, useState } from 'react'
import { EclipseResultCard } from '../components/EclipseResultCard'
import { GlobeScene } from '../components/GlobeScene'
import { findNextLocalSolarEclipse } from '../features/eclipse/eclipse-service'
import type { LocalSolarEclipse, ObserverLocation } from '../features/eclipse/types'

function App() {
  const [location, setLocation] = useState<ObserverLocation>()
  const [eclipse, setEclipse] = useState<LocalSolarEclipse>()
  const [calculationError, setCalculationError] = useState(false)

  const calculateForLocation = useCallback((coordinates: ObserverLocation) => {
    try {
      setCalculationError(false)
      setEclipse(findNextLocalSolarEclipse(coordinates))
    } catch {
      setEclipse(undefined)
      setCalculationError(true)
    }
  }, [])

  const selectLocation = (coordinates: ObserverLocation) => {
    setLocation(coordinates)
    calculateForLocation(coordinates)
  }

  return (
    <main className="atlas-shell">
      <header className="atlas-intro">
        <p className="eyebrow">A celestial field guide</p>
        <h1>Eclipse Atlas</h1>
        <p>Choose a point on Earth to find the next solar eclipse visible from that exact horizon.</p>
      </header>
      <div className="atlas-workspace">
        <GlobeScene onSelectCoordinates={selectLocation} selectedCoordinates={location} />
        <aside className="atlas-results" aria-live="polite">
          {eclipse && location ? (
            <EclipseResultCard eclipse={eclipse} location={location} />
          ) : calculationError && location ? (
            <section className="selection-prompt" aria-labelledby="calculation-error-heading" role="alert">
              <p className="eyebrow">Calculation interrupted</p>
              <h2 id="calculation-error-heading">We could not read this horizon</h2>
              <p>The selected point is saved. Try the eclipse calculation again.</p>
              <button className="retry-button" type="button" onClick={() => calculateForLocation(location)}>Try again</button>
            </section>
          ) : (
            <section className="selection-prompt" aria-labelledby="selection-prompt-heading">
              <p className="eyebrow">Your observing point</p>
              <h2 id="selection-prompt-heading">Find your next eclipse</h2>
              <p>Turn the globe, then select any visible point to calculate its local eclipse circumstances.</p>
            </section>
          )}
        </aside>
      </div>
    </main>
  )
}

export default App
