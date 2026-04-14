import { test, expect } from '@playwright/test'

const URL = '/2026-03-28-socratic-chat-shrinkwrap/index.html'
const PRETEXT_READY_TIMEOUT = 15_000

test.describe('Socratic Chat Shrinkwrap (PRD-03)', () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))

    await page.goto(URL)
    await page.waitForSelector('#statusBanner[hidden]', { state: 'attached', timeout: PRETEXT_READY_TIMEOUT })

    if (errors.length > 0) {
      throw new Error(`JS errors on load: ${errors.join('; ')}`)
    }
  })

  test('renders topic tabs for all three topics', async ({ page }) => {
    const tabs = page.locator('#topicTabs button')
    await expect(tabs).toHaveCount(3)
  })

  test('first topic loads with tutor messages', async ({ page }) => {
    // Tutor messages appear after a 360ms typing delay
    await page.waitForSelector('.bubble--tutor', { timeout: 5000 })
    const messages = page.locator('.bubble--tutor')
    const count = await messages.count()
    expect(count).toBeGreaterThan(0)
  })

  test('tutor bubbles have explicit pixel width set by Pretext', async ({ page }) => {
    const firstBubble = page.locator('.bubble--tutor').first()
    const style = await firstBubble.getAttribute('style')
    expect(style).toMatch(/width:\s*\d+\.?\d*px/)
  })

  test('choice buttons appear for the first topic', async ({ page }) => {
    await page.waitForSelector('.choice-button', { timeout: 5000 })
    const choices = page.locator('.choice-button')
    const count = await choices.count()
    expect(count).toBeGreaterThan(0)
  })

  test('choice bubble widths are Pretext-computed (not 100%)', async ({ page }) => {
    const firstChoice = page.locator('.choice-button').first()
    const style = await firstChoice.getAttribute('style')
    expect(style).toMatch(/width:\s*\d+\.?\d*px/)
    // Width should not be full container — shrinkwrap means it's tight
    const widthMatch = style?.match(/width:\s*(\d+)/)
    if (widthMatch) {
      const w = parseInt(widthMatch[1])
      expect(w).toBeGreaterThan(40)
      expect(w).toBeLessThan(700)
    }
  })

  test('selecting correct choice shows success reaction', async ({ page }) => {
    await page.waitForSelector('.choice-button', { timeout: 5000 })
    // First topic: "Subtract 4 from both sides" is correct (first option)
    const correctBtn = page.locator('.choice-button').first()
    await correctBtn.click()
    await page.waitForSelector('.bubble--reaction', { timeout: 5000 })
    const reactions = page.locator('.bubble--reaction')
    const count = await reactions.count()
    expect(count).toBeGreaterThan(0)
  })

  test('switching topics clears and reloads the thread', async ({ page }) => {
    const tabs = page.locator('#topicTabs button')
    // Click second topic
    await tabs.nth(1).click()
    await page.waitForTimeout(400)
    // Thread should have messages
    const messages = page.locator('.bubble--tutor')
    const count = await messages.count()
    expect(count).toBeGreaterThan(0)
  })

  test('CSS comparison toggle is present and functional', async ({ page }) => {
    const toggle = page.locator('#compareToggle')
    await expect(toggle).toBeVisible()
    await toggle.check()
    await page.waitForTimeout(200)
    // After toggling, mode badge should reflect CSS mode
    const badge = page.locator('#modeBadge')
    await expect(badge).toContainText('CSS')
  })

  test('progress panel shows step count', async ({ page }) => {
    const progressTitle = page.locator('#progressTitle')
    await expect(progressTitle).toContainText('of')
  })

  test('shrinkwrap savings metric is shown', async ({ page }) => {
    // Click the correct answer to trigger more messages
    await page.locator('.choice-button').first().click()
    await page.waitForTimeout(600)
    const savedPixels = page.locator('#savedPixels')
    const text = await savedPixels.innerText()
    expect(text.trim()).not.toBe('-- px')
  })
})
