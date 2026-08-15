import type { LocalSolarEclipse } from '../eclipse/types'

export interface EclipseTimeline {
  start: Date
  end: Date
  peak: Date
  durationSeconds: number
}

export const createEclipseTimeline = (eclipse: LocalSolarEclipse): EclipseTimeline => {
  const start = new Date(eclipse.partialPhase.begin.time.getTime() - 120_000)
  const end = eclipse.partialPhase.end.time
  return { start, end, peak: eclipse.peak.time, durationSeconds: (end.getTime() - start.getTime()) / 1000 }
}

export const timelineDate = (timeline: EclipseTimeline, elapsedSeconds: number) =>
  new Date(Math.min(timeline.durationSeconds, Math.max(0, elapsedSeconds)) * 1000 + timeline.start.getTime())

export const eclipseCoverageAt = (eclipse: LocalSolarEclipse, time: Date) => {
  const start = eclipse.partialPhase.begin.time.getTime()
  const peak = eclipse.peak.time.getTime()
  const end = eclipse.partialPhase.end.time.getTime()
  const current = time.getTime()
  if (current <= start || current >= end) return 0
  const phase = current <= peak ? (current - start) / (peak - start) : (end - current) / (end - peak)
  return eclipse.obscuration * Math.sin(Math.max(0, Math.min(1, phase)) * Math.PI / 2)
}
