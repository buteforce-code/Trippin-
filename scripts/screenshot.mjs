// Captures each screen at the 430px mobile frame width for visual verification.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const OUT = 'screenshots'
mkdirSync(OUT, { recursive: true })

const routes = [
  { path: '/', name: '01-home' },
  { path: '/money', name: '02-money-in' },
  { path: '/money?tab=out', name: '03-money-expenses' },
  { path: '/trip', name: '04-trip' },
  { path: '/gallery', name: '05-gallery' },
]

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 440, height: 900 },
  deviceScaleFactor: 2,
})
const page = await context.newPage()
const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
})
page.on('pageerror', (e) => errors.push(String(e)))

for (const r of routes) {
  await page.goto(BASE + r.path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200) // let count-up + donut settle
  await page.screenshot({ path: `${OUT}/${r.name}.png` })
  console.log('captured', r.name)
}

await browser.close()
if (errors.length) {
  console.log('\nCONSOLE ERRORS:')
  for (const e of errors) console.log(' -', e)
  process.exit(1)
}
console.log('\nNo console errors.')
