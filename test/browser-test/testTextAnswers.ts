import { assert } from 'chai'
import { Page } from 'puppeteer'
import { resolveFixture } from '../fixtures'
import createTestServer, { CloseFunction } from './createTestServer'
import { delay, getCurrentPage, getTextContent } from './domUtils'

describe('testTextAnswers.ts — Text answer interactions', function() {
  this.timeout(30000)

  let url: string
  let close: CloseFunction

  before('Start server', async () => {
    ;[url, close] = await createTestServer(resolveFixture('exams/A_X/A_X.xml'))
  })

  after('Close server', async () => {
    await close()
  })

  it('updates the character count', async () => {
    const page = getCurrentPage()
    await page.goto(url, { waitUntil: 'networkidle0' })

    await type(page, 'h')
    await assertCharacterCount(1)

    await type(page, 'e')
    await assertCharacterCount(2)

    await type(page, 'llo')
    await assertCharacterCount(5)

    await clearInput(page)
    await assertCharacterCount(0)
  })

  it('updates the saved indicator after a delay', async () => {
    const page = getCurrentPage()
    await page.goto(url, { waitUntil: 'networkidle0' })

    await assertIsSaved(false)

    await type(page, 'moi')
    await assertIsSaved(false)
    await delay(1000)
    await assertIsSaved(true)

    await type(page, ' kaikille')
    await assertIsSaved(false)
    await delay(1000)
    await assertIsSaved(true)

    await page.reload({ waitUntil: 'networkidle0' })
    await assertIsSaved(true)
  })
})

async function type(page: Page, text: string) {
  await page.type('.text-answer', text)
}

export async function clearInput(page: Page) {
  await page.click('.text-answer', { clickCount: 3 })
  await page.keyboard.press('Backspace')
}

async function assertCharacterCount(expectedCount: number) {
  const text = await getTextContent('.answer-toolbar__answer-length')
  const count = Number(text!.match(/\d+/)![0])
  return assert.equal(count, expectedCount)
}

async function assertIsSaved(saved: boolean) {
  const text = await getTextContent('.answer-toolbar__saved')
  return assert.equal(text, saved ? 'Tallennettu' : '')
}
