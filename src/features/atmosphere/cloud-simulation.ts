export interface CloudSimulationOptions {
  width?: number
  height?: number
  seed?: number
}

export interface CloudSimulation {
  width: number
  height: number
  humidity: Float32Array
  temperature: Float32Array
  cloudWater: Float32Array
  time: number
}

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const wrap = (value: number, size: number) => ((value % size) + size) % size
const cellIndex = (x: number, y: number, width: number) => y * width + wrap(x, width)

const seededRandom = (seed: number) => {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

const sample = (field: Float32Array, x: number, y: number, width: number, height: number) => {
  const safeY = Math.min(height - 1, Math.max(0, y))
  const x0 = Math.floor(x)
  const y0 = Math.floor(safeY)
  const xFraction = x - x0
  const yFraction = safeY - y0
  const x1 = wrap(x0 + 1, width)
  const y1 = Math.min(height - 1, y0 + 1)
  const top = field[cellIndex(x0, y0, width)] * (1 - xFraction) + field[cellIndex(x1, y0, width)] * xFraction
  const bottom = field[cellIndex(x0, y1, width)] * (1 - xFraction) + field[cellIndex(x1, y1, width)] * xFraction
  return top * (1 - yFraction) + bottom * yFraction
}

export const createCloudSimulation = ({ width = 192, height = 96, seed = 401 }: CloudSimulationOptions = {}): CloudSimulation => {
  const random = seededRandom(seed)
  const cells = width * height
  const humidity = new Float32Array(cells)
  const temperature = new Float32Array(cells)
  const cloudWater = new Float32Array(cells)

  for (let y = 0; y < height; y += 1) {
    const latitude = (y / (height - 1) - 0.5) * Math.PI
    const equatorialHeat = Math.cos(latitude)
    for (let x = 0; x < width; x += 1) {
      const index = cellIndex(x, y, width)
      const planetaryWave = Math.sin(x * 0.13 + Math.sin(latitude) * 3.7) * 0.1
      temperature[index] = clamp(0.22 + equatorialHeat * 0.68 + planetaryWave)
      humidity[index] = clamp(0.4 + equatorialHeat * 0.28 + Math.sin(x * 0.2 + y * 0.12) * 0.13 + (random() - 0.5) * 0.12)
      cloudWater[index] = clamp((humidity[index] - (0.57 + temperature[index] * 0.12)) * 2.5 + (random() - 0.55) * 0.15)
    }
  }

  return { width, height, humidity, temperature, cloudWater, time: 0 }
}

export const stepCloudSimulation = (simulation: CloudSimulation, seconds: number) => {
  const dt = Math.min(1.5, Math.max(0, seconds))
  if (dt === 0) return
  const { width, height, humidity, temperature, cloudWater } = simulation
  const nextHumidity = new Float32Array(humidity.length)
  const nextCloudWater = new Float32Array(cloudWater.length)
  const circulationTime = simulation.time * 0.18

  for (let y = 0; y < height; y += 1) {
    const latitude = (y / (height - 1) - 0.5) * Math.PI
    const windBand = Math.sin(latitude * 3) * 0.58 + Math.cos(latitude) * 0.17
    for (let x = 0; x < width; x += 1) {
      const index = cellIndex(x, y, width)
      const vortex = Math.sin(x * 0.095 + circulationTime) * Math.cos(y * 0.21 - circulationTime * 0.7)
      const sourceX = x - (windBand + vortex * 0.33) * dt
      const sourceY = y - (Math.cos(x * 0.07 - circulationTime) * Math.sin(latitude * 2) * 0.2) * dt
      const advectedHumidity = sample(humidity, sourceX, sourceY, width, height)
      const advectedCloud = sample(cloudWater, sourceX, sourceY, width, height)
      const north = cloudWater[cellIndex(x, Math.max(0, y - 1), width)]
      const south = cloudWater[cellIndex(x, Math.min(height - 1, y + 1), width)]
      const west = cloudWater[cellIndex(x - 1, y, width)]
      const east = cloudWater[cellIndex(x + 1, y, width)]
      const diffusion = (north + south + west + east - cloudWater[index] * 4) * 0.055 * dt
      const saturation = 0.49 + temperature[index] * 0.16 + Math.abs(latitude) * 0.08
      const condensation = Math.max(0, advectedHumidity - saturation) * 0.27 * dt
      const dryAir = Math.max(0, saturation - advectedHumidity)
      const evaporation = advectedCloud * (0.022 + temperature[index] * 0.035 + dryAir * 0.11) * dt
      const equilibriumHumidity = 0.35 + Math.max(0, Math.cos(latitude)) * 0.26 + vortex * 0.045
      const humidityRelaxation = (equilibriumHumidity - advectedHumidity) * 0.055 * dt
      const uplift = Math.max(0, vortex) * Math.max(0, Math.cos(latitude)) * 0.01 * dt
      nextCloudWater[index] = clamp(advectedCloud + condensation + diffusion - evaporation)
      nextHumidity[index] = clamp(advectedHumidity + humidityRelaxation + uplift - condensation * 0.8)
    }
  }

  humidity.set(nextHumidity)
  cloudWater.set(nextCloudWater)
  simulation.time += dt
}

export const writeCloudTexture = (simulation: CloudSimulation, target: Uint8Array) => {
  const { cloudWater, humidity, temperature } = simulation
  for (let index = 0; index < cloudWater.length; index += 1) {
    const offset = index * 4
    const density = clamp(cloudWater[index] * 1.32 + Math.max(0, humidity[index] - 0.68) * 0.24)
    const brightness = Math.round(202 + temperature[index] * 42)
    target[offset] = brightness
    target[offset + 1] = brightness
    target[offset + 2] = Math.min(255, brightness + 8)
    target[offset + 3] = Math.round(Math.pow(density, 0.72) * 215)
  }
}
