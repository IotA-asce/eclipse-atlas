import { expect, it } from 'vitest'
import { cloudFragmentShader, cloudVertexShader } from './cloud-shader'

it('uses the evolving weather map and bounded view/light marching', () => {
  expect(cloudVertexShader).toContain('vWorldPosition')
  expect(cloudFragmentShader).toContain('weatherMap')
  expect(cloudFragmentShader).toContain('#define CLOUD_STEPS 8')
  expect(cloudFragmentShader).toContain('#define LIGHT_STEPS 3')
  expect(cloudFragmentShader).toContain('exp(-extinction)')
})
