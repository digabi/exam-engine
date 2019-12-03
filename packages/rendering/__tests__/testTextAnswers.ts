import { CloseFunction, previewExam } from '@digabi/exam-engine-rendering'
import { resolveExam } from '@digabi/mexamples'
import { Page } from 'puppeteer'
import { delay, getTextContent, initPuppeteer } from './puppeteerUtils'

describe('testTextAnswers.ts — Text answer interactions', () => {
  const createPage = initPuppeteer()
  let page: Page
  let url: string
  let close: CloseFunction

  beforeAll(async () => {
    ;[url, close] = await previewExam(resolveExam('A_X/A_X.xml'), { deterministicRendering: true })
    page = await createPage()
  })

  afterAll(async () => {
    await close()
  })

  it('updates the character count', async () => {
    await page.goto(url, { waitUntil: 'networkidle0' })

    await type('h')
    await assertCharacterCount(1)

    await type('e')
    await assertCharacterCount(2)

    await type('llo')
    await assertCharacterCount(5)

    await clearInput()
    await assertCharacterCount(0)
  })

  it('updates the saved indicator after a delay', async () => {
    await page.goto(url, { waitUntil: 'networkidle0' })

    await assertIsSaved(false)

    await type('moi')
    await assertIsSaved(false)
    await delay(2000)
    await assertIsSaved(true)

    await type(' kaikille')
    await assertIsSaved(false)
    await delay(2000)
    await assertIsSaved(true)

    await page.reload({ waitUntil: 'networkidle0' })
    await assertIsSaved(true)
  })

  async function type(text: string) {
    await page.type('.text-answer', text)
  }

  async function clearInput() {
    await page.click('.text-answer', { clickCount: 3 })
    await page.keyboard.press('Backspace')
  }

  async function assertCharacterCount(expectedCount: number) {
    const text = await getTextContent(page, '.answer-toolbar__answer-length')
    const count = Number(text!.match(/\d+/)![0])
    expect(count).toEqual(expectedCount)
  }

  async function assertIsSaved(saved: boolean) {
    const text = await getTextContent(page, '.answer-toolbar__saved')
    return expect(text).toEqual(saved ? 'Tallennettu' : '')
  }
})
