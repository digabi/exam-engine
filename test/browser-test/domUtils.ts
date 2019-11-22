'use strict'

import puppeteer, { Browser, BrowserContext, Page } from 'puppeteer'

const isInDebugMode = (process.env.PUPPETEER_DEBUG || '') === '1'

let browser: Browser
let context: BrowserContext
let page: Page

before(async function() {
  this.timeout(30000) // In CI puppeteer launch can take quite a while occasionally
  browser = await puppeteer.launch({ headless: !isInDebugMode })
  context = await browser.createIncognitoBrowserContext()
  page = await newPage()
})
after(async () => {
  await browser.close()
})

async function newPage() {
  const result = await context.newPage()
  await result.setViewport({ width: 1280, height: 1024 })
  return result
}

export function initSuite(suite: Mocha.Suite, timeoutMillis: string | number) {
  suite.enableTimeouts(!isInDebugMode)
  if (!isInDebugMode) {
    suite.timeout(timeoutMillis)
  }
}

export function getCurrentPage() {
  return page
}

export async function delay(millis: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, millis))
}

// Normally unused, but very useful for debugging
export async function halt() {
  // tslint:disable-next-line no-console
  console.error('Test execution halted')
  await page.waitFor(2000000) // 2 million milliseconds should be enough for everybody
}

export async function getInnerText(selector: string) {
  return page.$eval(selector, e => {
    if (e instanceof HTMLElement) {
      return e.innerText
    } else {
      throw new Error(`Expected a HTML element, got ${e}`)
    }
  })
}

export async function getOuterHtml(selector: string) {
  return page.$eval(selector, e => {
    if (e instanceof HTMLElement) {
      return e.outerHTML
    } else {
      throw new Error(`Expected a HTML element, got ${e}`)
    }
  })
}

export async function getTextContent(selector: string) {
  return page.$eval(selector, e => {
    if (e instanceof HTMLElement) {
      return e.textContent!.trim()
    } else {
      throw new Error(`Expected a HTML element, got ${e}`)
    }
  })
}
