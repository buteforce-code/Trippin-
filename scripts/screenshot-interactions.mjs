// Verifies the sheets and theme switching by driving real interactions.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = 'screenshots'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 440, height: 900 }, deviceScaleFactor: 2 })
const page = await context.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))

// Add-Expense sheet (center + button)
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'Add expense' }).first().click()
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/06-add-sheet.png` })
console.log('captured 06-add-sheet')

// Activity-Log sheet (header clock button)
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'Open activity log' }).click()
await page.waitForTimeout(500)
await page.screenshot({ path: `${OUT}/07-log-sheet.png` })
console.log('captured 07-log-sheet')

// Sunset theme on Home
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.getByRole('button', { name: 'sunset theme' }).click()
await page.waitForTimeout(1200)
await page.screenshot({ path: `${OUT}/08-home-sunset.png` })
console.log('captured 08-home-sunset')

// Record a payment for Nisha (pending) then re-check Money In numbers
await page.goto(BASE + '/money', { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
const recordButtons = page.getByRole('button', { name: '+ Record' })
const before = await recordButtons.count()
await recordButtons.last().click()
await page.waitForTimeout(600)
const after = await page.getByRole('button', { name: '+ Record' }).count()
console.log(`record buttons: ${before} -> ${after} (expect one fewer)`)
await page.screenshot({ path: `${OUT}/09-after-record.png` })

await browser.close()
if (errors.length) {
  console.log('\nPAGE ERRORS:', errors)
  process.exit(1)
}
console.log('\nNo page errors.')
