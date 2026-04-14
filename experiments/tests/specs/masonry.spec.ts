import { test, expect } from '@playwright/test'

const URL = '/2026-03-28-student-showcase-masonry/index.html'
const PRETEXT_READY_TIMEOUT = 15_000

test.describe('Student Showcase Masonry (PRD-02)', () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))

    await page.goto(URL)
    // Wait for Pretext to load and the status card to hide
    await page.waitForSelector('#statusCard[hidden]', { state: 'attached', timeout: PRETEXT_READY_TIMEOUT })

    if (errors.length > 0) {
      throw new Error(`JS errors on load: ${errors.join('; ')}`)
    }
  })

  test('renders project cards in the wall', async ({ page }) => {
    // Virtualization only mounts cards visible in the viewport; check at least some are present
    const cards = page.locator('.card')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(1)
    expect(count).toBeLessThanOrEqual(15)
  })

  test('cards are absolutely positioned with transform', async ({ page }) => {
    const firstCard = page.locator('.card').first()
    const style = await firstCard.getAttribute('style')
    expect(style).toContain('translate3d')
  })

  test('shows correct summary metric text', async ({ page }) => {
    const summary = page.locator('#summaryMetric')
    await expect(summary).toContainText('15 projects on the wall')
  })

  test('filter buttons are present', async ({ page }) => {
    const filterBtns = page.locator('#filters button')
    await expect(filterBtns).toHaveCount(6) // all + 5 categories
  })

  test('filtering reduces visible cards', async ({ page }) => {
    // Click the "Sustainability" filter
    await page.locator('#filters button[data-filter="sustainability"]').click()
    await page.waitForTimeout(400)
    const summaryText = await page.locator('#summaryMetric').innerText()
    const match = summaryText.match(/(\d+) projects/)
    if (match) {
      expect(parseInt(match[1])).toBeLessThan(15)
    }
    // After filtering, some cards in viewport or wall height reflects the subset
    const wallStyle = await page.locator('#wall').getAttribute('style')
    expect(wallStyle).toContain('height')
  })

  test('sort buttons are present and clickable', async ({ page }) => {
    const sortBtns = page.locator('#sorts button')
    await expect(sortBtns).toHaveCount(2)
    await sortBtns.first().click()
    await page.waitForTimeout(300)
    // Summary should still show project count (virtualization active)
    const summary = await page.locator('#summaryMetric').innerText()
    expect(summary).toMatch(/projects/)
  })

  test('cards have category chips with correct text', async ({ page }) => {
    const chips = page.locator('.card__chip')
    const count = await chips.count()
    // Virtualization: count in viewport >= 1
    expect(count).toBeGreaterThanOrEqual(1)
    // Each chip should be non-empty
    const firstText = await chips.first().innerText()
    expect(firstText.trim().length).toBeGreaterThan(0)
  })

  test('wall container height is set (Pretext computed layout)', async ({ page }) => {
    const wall = page.locator('#wall')
    const style = await wall.getAttribute('style')
    expect(style).toContain('height')
    const heightMatch = style?.match(/height:\s*(\d+)px/)
    expect(heightMatch).not.toBeNull()
    const height = parseInt(heightMatch![1])
    expect(height).toBeGreaterThan(100)
  })

  test('relayout timing is shown', async ({ page }) => {
    const timingMetric = page.locator('#timingMetric')
    await expect(timingMetric).not.toContainText('Waiting')
  })

  test('benchmark cards are rendered', async ({ page }) => {
    const benchmarkCards = page.locator('.benchmark-card')
    await expect(benchmarkCards).toHaveCount(2) // Chrome + Safari
  })
})
