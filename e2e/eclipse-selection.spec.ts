import { expect, test } from 'playwright/test'

test('selecting the visible Earth surface produces an eclipse result', async ({ page }) => {
  await page.goto('/')

  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  await expect(page.getByText('Loading Earth map…')).toBeHidden({ timeout: 15_000 })

  const box = await canvas.boundingBox()
  if (!box) throw new Error('The globe canvas did not have a visible bounding box.')

  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  await expect(page.getByRole('region', { name: 'Next visible solar eclipse' })).toBeVisible({ timeout: 15_000 })
})
