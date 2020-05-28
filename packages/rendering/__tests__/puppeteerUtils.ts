'use strict'

import puppeteer, { Browser, Page } from 'puppeteer'

const isInDebugMode = process.env.PUPPETEER_DEBUG === '1'

export function initPuppeteer() {
  let browser: Browser
  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: !isInDebugMode })
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

export async function loadExam(page: Page, url: string) {
  await page.goto(url)
  await page.waitForSelector('.e-exam')
}

export async function delay(millis: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, millis))
}

// Normally unused, but very useful for debugging
export async function halt(page: Page) {
  console.error('Test execution halted')
  await page.waitFor(2000000) // 2 million milliseconds should be enough for everybody
}

export async function getInnerText(page: Page, selector: string) {
  return page.$eval(selector, (e) => {
    if (e instanceof HTMLElement) {
      return e.innerText
    } else {
      throw new Error(`Expected a HTML element, got ${e}`)
    }
  })
}

export async function getOuterHtml(page: Page, selector: string) {
  return page.$eval(selector, (e) => {
    if (e instanceof HTMLElement) {
      return e.outerHTML
    } else {
      throw new Error(`Expected a HTML element, got ${e}`)
    }
  })
}

export async function getTextContent(page: Page, selector: string) {
  return page.$eval(selector, (e) => {
    if (e instanceof HTMLElement) {
      return e.textContent!.trim()
    } else {
      throw new Error(`Expected a HTML element, got ${e}`)
    }
  })
}

// TODO is there a prettier way?
export async function expectElementNotToExist(page: Page, selector: string) {
  let thrown = false
  try {
    await page.$eval(selector, (e) => e)
  } catch (expected) {
    thrown = true
  }
  expect(thrown).toBe(true)
}
