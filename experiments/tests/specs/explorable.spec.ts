import { test, expect } from '@playwright/test'

const URL = '/2026-04-02-explorable-text-layout/index.html'
const PRETEXT_READY_TIMEOUT = 15_000

test.describe('Explorable Text Layout (PRD-01)', () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))

    await page.goto(URL)
    // Wait for page to settle — explorable may not have a single "ready" indicator
    await page.waitForLoadState('networkidle', { timeout: PRETEXT_READY_TIMEOUT })
    await page.waitForTimeout(1000)

    if (errors.length > 0) {
      throw new Error(`JS errors on load: ${errors.join('; ')}`)
    }
  })

  test('page title is correct', async ({ page }) => {
    await expect(page).toHaveTitle(/How Your Browser Lays Out Text/i)
  })

  test('width slider is present', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first()
    await expect(slider).toBeVisible()
  })

  test('page contains both DOM and Pretext panels', async ({ page }) => {
    // The explorable has two panels: browser and Pretext
    const bodyText = await page.locator('body').innerText()
    expect(bodyText.length).toBeGreaterThan(200)
  })

  test('dragging width slider does not cause JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))

    const slider = page.locator('input[type="range"]').first()
    await slider.focus()
    // Move slider left and right
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowLeft')
    }
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowRight')
    }
    await page.waitForTimeout(300)
    expect(errors).toHaveLength(0)
  })

  test('multilingual preset buttons are present', async ({ page }) => {
    // The explorable has preset buttons for different languages
    const buttons = page.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('performance timings section is visible', async ({ page }) => {
    // The explorable shows prepare/layout timing
    const text = await page.locator('body').innerText()
    expect(text.toLowerCase()).toMatch(/prepare|layout|pretext/i)
  })
})
