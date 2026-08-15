import type { ReactNode } from 'react'
import { presentEclipse, type PresentationOptions } from '../features/eclipse/presentation'
import type { LocalSolarEclipse, ObserverLocation } from '../features/eclipse/types'

interface EclipseResultCardProps extends PresentationOptions {
  eclipse: LocalSolarEclipse
  location: ObserverLocation
}

interface ResultRowProps {
  term: string
  children: ReactNode
}

const ResultRow = ({ term, children }: ResultRowProps) => (
  <div>
    <dt>{term}</dt>
    <dd>{children}</dd>
  </div>
)

/** Displays a calculation result; decorative celestial visuals never affect this data. */
export const EclipseResultCard = ({ eclipse, location, locale, timeZone }: EclipseResultCardProps) => {
  const result = presentEclipse(eclipse, location, { locale, timeZone })

  return (
    <section aria-labelledby="eclipse-result-heading">
      <h2 id="eclipse-result-heading">Next visible solar eclipse</h2>
      <dl>
        <ResultRow term="Location">{result.coordinates}</ResultRow>
        <ResultRow term="Eclipse type">{result.type}</ResultRow>
        <ResultRow term="Peak local time">{result.peak}</ResultRow>
        <ResultRow term="Maximum coverage">{result.coverage}</ResultRow>
        <ResultRow term={result.partialPhase.label}>
          Begins {result.partialPhase.begin}; ends {result.partialPhase.end}.
        </ResultRow>
        {result.centralPhase ? (
          <ResultRow term={result.centralPhase.label}>
            Begins {result.centralPhase.begin}; ends {result.centralPhase.end}.
          </ResultRow>
        ) : null}
      </dl>
      <p>Visualization is not to scale.</p>
    </section>
  )
}
