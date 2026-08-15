import { expect, it } from 'vitest'
import { createCloudSimulation, stepCloudSimulation, writeCloudTexture } from './cloud-simulation'

it('creates deterministic atmospheric fields that remain bounded', () => {
  const first = createCloudSimulation({ width: 32, height: 16, seed: 9 })
  const second = createCloudSimulation({ width: 32, height: 16, seed: 9 })

  expect(first.cloudWater).toEqual(second.cloudWater)
  expect([...first.humidity, ...first.temperature, ...first.cloudWater].every((value) => value >= 0 && value <= 1)).toBe(true)
})

it('advects, condenses, diffuses, and dissipates cloud water without leaving valid bounds', () => {
  const simulation = createCloudSimulation({ width: 32, height: 16, seed: 9 })
  const before = simulation.cloudWater.slice()

  stepCloudSimulation(simulation, 1)

  expect(simulation.cloudWater).not.toEqual(before)
  expect([...simulation.humidity, ...simulation.cloudWater].every((value) => value >= 0 && value <= 1)).toBe(true)
})

it('keeps global cloud coverage below saturation during a prolonged simulation', () => {
  const simulation = createCloudSimulation({ width: 32, height: 16, seed: 9 })

  for (let step = 0; step < 600; step += 1) stepCloudSimulation(simulation, 1)

  const meanCloudWater = simulation.cloudWater.reduce((total, value) => total + value, 0) / simulation.cloudWater.length
  const denseCloudCells = simulation.cloudWater.filter((value) => value > 0.8).length
  expect(meanCloudWater).toBeLessThan(0.42)
  expect(denseCloudCells).toBeLessThan(80)
})

it('encodes the evolving cloud water into an alpha-enabled RGBA texture', () => {
  const simulation = createCloudSimulation({ width: 16, height: 8, seed: 9 })
  const target = new Uint8Array(simulation.width * simulation.height * 4)

  writeCloudTexture(simulation, target)

  expect(target.some((value, index) => index % 4 === 3 && value > 0)).toBe(true)
  expect(target.every((value) => value >= 0 && value <= 255)).toBe(true)
})
