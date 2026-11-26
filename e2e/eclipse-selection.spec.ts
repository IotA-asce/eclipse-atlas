import { expect, test } from 'playwright/test'

test.use({ timezoneId: 'Pacific/Auckland' })

test('globe and coordinate selection show eclipse results in the browser time zone', async ({ page }) => {
  await page.goto('/')

  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  await expect(page.getByText('Loading Earth map…')).toBeHidden({ timeout: 15_000 })

  const box = await canvas.boundingBox()
  if (!box) throw new Error('The globe canvas did not have a visible bounding box.')

  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  const result = page.getByRole('region', { name: 'Next visible solar eclipse' })
  await expect(result).toBeVisible({ timeout: 15_000 })
  await page.getByRole('button', { name: 'Enter coordinates' }).click()
  await page.getByLabel('Latitude (° north)').fill('40.7128')
  await page.getByLabel('Longitude (° east)').fill('-74.006')
  await page.getByRole('button', { name: 'Choose this point' }).click()
  await expect(result.getByText('40.71° N, 74.01° W')).toBeVisible()
  await expect(result.getByText('All times shown in Pacific/Auckland.')).toBeVisible()
  await page.getByRole('button', { name: 'Jump to eclipse' }).click()
  await expect(page.getByRole('main', { name: 'Eclipse time jump simulation' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Exit simulation' })).toBeVisible()
})
