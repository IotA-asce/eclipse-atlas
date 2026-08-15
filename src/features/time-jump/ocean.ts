export interface OceanSample { height: number; slopeX: number; slopeZ: number }

const waves = [
  { amplitude: 0.42, wavelength: 12, speed: 1.45, x: 0.92, z: 0.38 },
  { amplitude: 0.24, wavelength: 6.5, speed: 2.1, x: -0.4, z: 0.92 },
  { amplitude: 0.12, wavelength: 3.2, speed: 3.3, x: 0.67, z: -0.74 },
]

export const sampleOcean = (x: number, z: number, time: number): OceanSample => waves.reduce((sample, wave) => {
  const waveNumber = (Math.PI * 2) / wave.wavelength
  const phase = waveNumber * (wave.x * x + wave.z * z) - wave.speed * time
  const derivative = wave.amplitude * waveNumber * Math.cos(phase)
  return { height: sample.height + wave.amplitude * Math.sin(phase), slopeX: sample.slopeX + derivative * wave.x, slopeZ: sample.slopeZ + derivative * wave.z }
}, { height: 0, slopeX: 0, slopeZ: 0 })

export const vesselAttitude = (length: number, beam: number, time: number) => {
  const bow = sampleOcean(0, -length / 2, time).height
  const stern = sampleOcean(0, length / 2, time).height
  const port = sampleOcean(-beam / 2, 0, time).height
  const starboard = sampleOcean(beam / 2, 0, time).height
  return { heave: sampleOcean(0, 0, time).height, pitch: Math.atan2(bow - stern, length), roll: Math.atan2(port - starboard, beam) }
}
