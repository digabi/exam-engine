'use strict'

import puppeteer, { Browser, Page } from 'puppeteer'

const isInDebugMode = process.env.PUPPETEER_DEBUG === '1'

export function initPuppeteer(): () => Promise<Page> {
  let browser: Browser
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: isInDebugMode ? false : 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  })
  afterAll(async () => {
    await browser.close()
  })

  return async function createPage() {
    const context = await browser.createIncognitoBrowserContext()
    const page = await context.newPage()
    page.setDefaultNavigationTimeout(60000)
    await page.setViewport({ width: 1280, height: 3024 })
    return page
  }
}

export async function loadExam(page: Page, url: string): Promise<void> {
  await page.goto(url)
  await page.waitForSelector('.e-exam')
}

export async function delay(millis: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, millis))
}

// Normally unused, but very useful for debugging
export async function halt(page: Page): Promise<void> {
  console.error('Test execution halted')
  await page.waitForTimeout(2000000) // 2 million milliseconds should be enough for everybody
}

export async function getInnerText(page: Page, selector: string): Promise<string> {
  return page.$eval(selector, (e) => {
    if (e instanceof HTMLElement) {
      return e.innerText
    } else {
      throw new Error(`Expected a HTML element, got ${e.localName}`)
    }
  })
}

export async function getOuterHtml(page: Page, selector: string): Promise<string> {
  return page.$eval(selector, (e) => {
    if (e instanceof HTMLElement) {
      return e.outerHTML
    } else {
      throw new Error(`Expected a HTML element, got ${e.localName}`)
    }
  })
}

export async function getTextContent(page: Page, selector: string): Promise<string> {
  return page.$eval(selector, (e) => {
    if (e instanceof HTMLElement) {
      return e.textContent!.trim()
    } else {
      throw new Error(`Expected a HTML element, got ${e.localName}`)
    }
  })
}

export async function getPageAndRequestErrors(page: Page, filename: string) {
  const requestErrors: string[] = []
  const pageErrors: Error[] = []

  page.on('requestfailed', (req) => {
    const errorText = req.failure()!.errorText
    if (errorText !== 'net::ERR_ABORTED') {
      requestErrors.push(req.url())
    }
  })
  page.on('pageerror', (err) => pageErrors.push(err))

  await page.goto(`file://${filename}`, { waitUntil: 'networkidle0' })
  return { requestErrors, pageErrors }
}
