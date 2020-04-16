import { resolveExam } from '@digabi/exam-engine-exams'
import { PreviewContext, previewExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { assertElementDoesNotExist, delay, getTextContent, initPuppeteer, loadExam } from './puppeteerUtils'

describe('testTextAnswers.ts — Text answer interactions', () => {
  const createPage = initPuppeteer()
  let page: Page
  let ctx: PreviewContext

  beforeAll(async () => {
    ctx = await previewExam(resolveExam('A_X/A_X.xml'))
    page = await createPage()
  })

  afterAll(async () => {
    await ctx.close()
  })

  it('updates the character count', async () => {
    await loadExam(page, ctx.url)

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
    await loadExam(page, ctx.url)

    await assertSaveIndicatorNotPresent()

    await type('moi')
    await assertIsNotSaved()
    await delay(2000)
    await assertIsSaved()

    await type(' kaikille')
    await assertIsNotSaved()
    await delay(2000)
    await assertIsSaved()

    await loadExam(page, ctx.url)
    await assertIsSaved()
  })

  const type = (text: string) => page.type('.text-answer', text)

  async function clearInput() {
    await page.click('.text-answer', { clickCount: 3 })
    await page.keyboard.press('Backspace')
  }

  async function assertCharacterCount(expectedCount: number) {
    const text = await getTextContent(page, '.answer-toolbar__answer-length')
    const count = Number(/\d+/.exec(text))
    expect(count).toEqual(expectedCount)
  }

  const assertIsSaved = () => page.$eval('.save-indicator-text--saved', (e) => e)

  const assertIsNotSaved = () => assertElementDoesNotExist(page, '.save-indicator-text--saved')

  const assertSaveIndicatorNotPresent = () => assertElementDoesNotExist(page, '.save-indicator')
})
