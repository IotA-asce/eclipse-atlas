import { Component, lazy, Suspense, type ReactNode } from 'react'
import type { LocalSolarEclipse, ObserverLocation } from '../features/eclipse/types'

const TimeJump = lazy(() => import('./EclipseTimeJump').then(({ EclipseTimeJump }) => ({ default: EclipseTimeJump })))

interface DeferredTimeJumpProps {
  eclipse: LocalSolarEclipse
  location: ObserverLocation
  onExit: () => void
}

export const TimeJumpLoadState = ({ failed = false, onExit }: { failed?: boolean; onExit: () => void }) => (
  <main className="atlas-shell">
    <section className="time-jump__hud" role={failed ? 'alert' : 'status'} aria-labelledby="time-jump-load-heading">
      <p className="eyebrow">Eclipse time jump</p>
      <h1 id="time-jump-load-heading">{failed ? 'Eclipse view unavailable' : 'Loading eclipse view…'}</h1>
      <p>{failed ? 'We could not open this view.' : 'Preparing the observer view.'} Your observing point and eclipse result remain available on the globe.</p>
      <button className="retry-button" type="button" onClick={onExit}>Back to globe</button>
    </section>
  </main>
)

export class TimeJumpBoundary extends Component<{ children: ReactNode; onExit: () => void }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? <TimeJumpLoadState failed onExit={this.props.onExit} /> : this.props.children
  }
}

export const DeferredTimeJump = (props: DeferredTimeJumpProps) => (
  <TimeJumpBoundary onExit={props.onExit}>
    <Suspense fallback={<TimeJumpLoadState onExit={props.onExit} />}>
      <TimeJump {...props} />
    </Suspense>
  </TimeJumpBoundary>
)
