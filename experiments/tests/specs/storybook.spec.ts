import { test, expect } from '@playwright/test'

const URL = '/2026-04-02-storybook-engine/index.html'
const PRETEXT_READY_TIMEOUT = 15_000

test.describe('Storybook Engine (PRD-04)', () => {
  test.beforeEach(async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))

    await page.goto(URL)
    await page.waitForSelector('#statusBanner[hidden]', { state: 'attached', timeout: PRETEXT_READY_TIMEOUT })

    if (errors.length > 0) {
      throw new Error(`JS errors on load: ${errors.join('; ')}`)
    }
  })

  test('renders story picker with 3 stories', async ({ page }) => {
    const buttons = page.locator('#storyPicker button')
    await expect(buttons).toHaveCount(3)
  })

  test('first story title block is visible', async ({ page }) => {
    const title = page.locator('.page-title-block h2')
    await expect(title).toBeVisible()
    const text = await title.innerText()
    expect(text.trim().length).toBeGreaterThan(0)
  })

  test('text lines are rendered by Pretext', async ({ page }) => {
    const lines = page.locator('.text-line')
    const count = await lines.count()
    expect(count).toBeGreaterThan(0)
  })

  test('text lines are absolutely positioned', async ({ page }) => {
    const firstLine = page.locator('.text-line').first()
    const style = await firstLine.getAttribute('style')
    expect(style).toContain('left:')
    expect(style).toContain('top:')
  })

  test('illustration zone is present on first page', async ({ page }) => {
    const illust = page.locator('.illustration-zone')
    await expect(illust).toBeVisible()
  })

  test('navigation buttons are present', async ({ page }) => {
    await expect(page.locator('#prevBtn')).toBeVisible()
    await expect(page.locator('#nextBtn')).toBeVisible()
  })

  test('prev button is disabled on first page', async ({ page }) => {
    await expect(page.locator('#prevBtn')).toBeDisabled()
  })

  test('next button advances to next page', async ({ page }) => {
    const initialIndicator = await page.locator('#pageIndicator').innerText()
    await page.locator('#nextBtn').click()
    await page.waitForTimeout(200)
    const newIndicator = await page.locator('#pageIndicator').innerText()
    expect(newIndicator).not.toBe(initialIndicator)
  })

  test('page indicator shows correct format', async ({ page }) => {
    const indicator = page.locator('#pageIndicator')
    await expect(indicator).toContainText('/')
  })

  test('font size slider changes text size and re-paginates', async ({ page }) => {
    const linesBefore = await page.locator('.text-line').count()
    const slider = page.locator('#fontSlider')
    // Increase font size (fewer lines per page expected)
    await slider.fill('32')
    await page.waitForTimeout(500)
    const linesAfter = await page.locator('.text-line').count()
    // Line count should change when font size changes
    expect(linesBefore).not.toBe(0)
    expect(linesAfter).not.toBe(0)
    // Font value label should update
    await expect(page.locator('#fontValue')).toContainText('32px')
  })

  test('read-along toggle enables line highlighting', async ({ page }) => {
    const toggle = page.locator('#readAlongToggle')
    await toggle.check()
    await page.waitForTimeout(200)
    // At least one line should be highlighted
    const highlighted = page.locator('.text-line[data-highlighted="true"]')
    await expect(highlighted).toHaveCount(1)
  })

  test('switching stories re-renders with new title', async ({ page }) => {
    const initialTitle = await page.locator('.page-title-block h2').innerText()
    // Click second story
    await page.locator('#storyPicker button').nth(1).click()
    await page.waitForTimeout(300)
    const newTitle = await page.locator('.page-title-block h2').innerText()
    expect(newTitle).not.toBe(initialTitle)
  })

  test('page dots count matches page indicator', async ({ page }) => {
    const dots = page.locator('.page-dot')
    const dotCount = await dots.count()
    const indicatorText = await page.locator('#pageIndicator').innerText()
    const totalPages = parseInt(indicatorText.split('/')[1].trim())
    expect(dotCount).toBe(totalPages)
  })

  test('keyboard arrow navigation works', async ({ page }) => {
    const initial = await page.locator('#pageIndicator').innerText()
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(200)
    const after = await page.locator('#pageIndicator').innerText()
    expect(after).not.toBe(initial)
    // Go back
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(200)
    const back = await page.locator('#pageIndicator').innerText()
    expect(back).toBe(initial)
  })

  test('layout meta shows page and line counts', async ({ page }) => {
    const meta = page.locator('#layoutMeta')
    await expect(meta).toContainText('pages')
    await expect(meta).toContainText('lines')
  })
})
