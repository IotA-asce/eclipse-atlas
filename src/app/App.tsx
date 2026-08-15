import { useState } from 'react'
import { EclipseResultCard } from '../components/EclipseResultCard'
import { GlobeScene } from '../components/GlobeScene'
import { findNextLocalSolarEclipse } from '../features/eclipse/eclipse-service'
import type { LocalSolarEclipse, ObserverLocation } from '../features/eclipse/types'

function App() {
  const [location, setLocation] = useState<ObserverLocation>()
  const [eclipse, setEclipse] = useState<LocalSolarEclipse>()

  const selectLocation = (coordinates: ObserverLocation) => {
    setLocation(coordinates)
    setEclipse(findNextLocalSolarEclipse(coordinates))
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
