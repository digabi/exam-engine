import { resolveExam } from '@digabi/exam-engine-exams'
import { PreviewContext, previewExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { getTextContent, initPuppeteer, loadExam } from './puppeteerUtils'

const DEFAULT_QUESTION_ID = 95

describe('testTextAnswers.ts — Text answer interactions', () => {
  const createPage = initPuppeteer()
  let page: Page
  let ctx: PreviewContext

  beforeAll(async () => {
    ctx = await previewExam(resolveExam('SC/SC.xml'))
    page = await createPage()
  })

  afterAll(async () => {
    await ctx.close()
  })

  it('updates the character count', async () => {
    await loadExam(page, ctx.url)

    await type('h')
    await expectCharacterCountToBe(1)

    await type('e')
    await expectCharacterCountToBe(2)

    await type('llo')
    await expectCharacterCountToBe(5)

    await clearInput()
    await expectCharacterCountToBe(0)
  })

  it('updates the saved indicator after a delay', async () => {
    await loadExam(page, ctx.url)

    await expectSaveIndicatorNotToExist()

    await type('moi')
    await expectNotToBeSaved()
    await expectToBeSaved()

    await type(' kaikille')
    await expectNotToBeSaved()
    await expectToBeSaved()

    await loadExam(page, ctx.url)
    await expectToBeSaved()
  })

  it('shows the error indicator when too many answers', async () => {
    await loadExam(page, ctx.url)
    await expectErrorIndicatorToDisappear()
    await type('oikea vastaus', DEFAULT_QUESTION_ID)
    await type('oikea vastaus 2', DEFAULT_QUESTION_ID + 1)
    await expectErrorIndicator('Tehtävä 21: Vastaa joko kohtaan 21.1 tai 21.2.')

    const questionName = await page.$('.sidebar-toc-container li[data-list-number="21."]')
    const className = await (await questionName?.getProperty('className'))?.jsonValue()
    expect(className).toContain('error')

    await clearInput(DEFAULT_QUESTION_ID)
    await expectErrorIndicatorToDisappear()

    const classNameThen = await (await questionName?.getProperty('className'))?.jsonValue()
    expect(classNameThen).not.toContain('error')
  })

  it('shows the error indicator when answer is too long', async () => {
    await loadExam(page, ctx.url)
    await clearInput(DEFAULT_QUESTION_ID)
    await expectErrorIndicatorToDisappear()
    await type('o'.repeat(250), DEFAULT_QUESTION_ID)
    const temp = await page.waitForSelector(
      `.sidebar-toc-container div[data-indicator-id="${DEFAULT_QUESTION_ID}"].error`
    )
    const className = await temp?.getProperty('className').then(e => e.jsonValue())
    expect(className).toContain('error')
    await expectErrorIndicator('Tehtävä 21.1: Vastaus on liian pitkä.')
  })

  it('opens rich text answer in writer mode, and exits', async () => {
    await loadExam(page, ctx.url)

    const body = await page.$('body')
    const fullScreenSelector = 'div[data-full-screen-id="1.2"]'
    const answerText = 'vastaukseni'

    await openWriterMode(page)
    await type(answerText, 2)
    await page.click(`${fullScreenSelector} .expand.close`)
    const bodyClass = await (await body?.getProperty('className'))?.jsonValue()
    expect(bodyClass).not.toContain('writer-mode')

    const fullScreen = await page.$(fullScreenSelector)
    expect(fullScreen).toBeFalsy()

    const answerBox = await page.$('.text-answer[data-question-id="2"]')
    const answer = await (await answerBox?.getProperty('innerHTML'))?.jsonValue()
    expect(answer).toBe(answerText)
  })

  it('Tab key does not change focus in writing mode', async () => {
    await loadExam(page, ctx.url)

    const textareaFocusedSelector = 'div[data-full-screen-id="1.2"] .text-answer--rich-text.rich-text-focused'

    await openWriterMode(page)
    const textareaFocused = await page.$(textareaFocusedSelector)
    expect(textareaFocused).toBeTruthy()

    await page.keyboard.press('Tab')
    const textareaFocusedThen = await page.$(textareaFocusedSelector)
    expect(textareaFocusedThen).toBeTruthy()
  })

  const openWriterMode = async (page: Page) => {
    // focus the textarea first, because it's z-index may affect clickability of the expand button
    await page.click('.text-answer[data-question-id="2"]')
    await page.click('.text-answer[data-question-id="2"] + .expand')
    const body = await page.$('body')
    const fullScreenSelector = 'div[data-full-screen-id="1.2"]'

    const fullScreen = await page.$(fullScreenSelector)
    expect(fullScreen).toBeTruthy()

    const bodyClass = await (await body?.getProperty('className'))?.jsonValue()
    expect(bodyClass).toContain('writer-mode')
  }

  it('a text answer indicator has correct state in side navigation', async () => {
    await loadExam(page, ctx.url)
    await clearInput(DEFAULT_QUESTION_ID)
    const indicator = await page.$(`.sidebar-toc-container div[data-indicator-id="${DEFAULT_QUESTION_ID}"]`)

    const className = await (await indicator?.getProperty('className'))?.jsonValue()
    const indicatorValue = await (await indicator?.getProperty('innerHTML'))?.jsonValue()
    await type('testivastaus', DEFAULT_QUESTION_ID)
    const classNameThen = await (await indicator?.getProperty('className'))?.jsonValue()
    const indicatorValueThen = await (await indicator?.getProperty('innerHTML'))?.jsonValue()
    await clearInput(DEFAULT_QUESTION_ID)
    const classNameFinally = await (await indicator?.getProperty('className'))?.jsonValue()
    const indicatorValueFinally = await (await indicator?.getProperty('innerHTML'))?.jsonValue()

    expect(className).not.toContain('ok')
    expect(indicatorValue).toContain('')
    expect(classNameThen).toContain('answer-indicator ok')
    expect(indicatorValueThen).toContain('12')
    expect(classNameFinally).not.toContain('ok')
    expect(indicatorValueFinally).toContain('')
  })

  describe('Test integer answer', () => {
    const createPage = initPuppeteer()
    let page: Page
    let ctx: PreviewContext
    beforeAll(async () => {
      ctx = await previewExam(resolveExam('N/N.xml'))
      page = await createPage()
    })

    afterAll(async () => {
      await ctx.close()
    })

    it("remembers integer answer's value after reloading", async () => {
      await loadExam(page, ctx.url)
      await setIntegerAnswer(page, 1, -3)
      await loadExam(page, ctx.url)
      expect(await getIntegerValue(page, 1)).toBe(-3)
      await setIntegerAnswer(page, 2, 0)
      await loadExam(page, ctx.url)
      expect(await getIntegerValue(page, 2)).toBe(0)

      await setIntegerAnswer(page, 3, 10)
      await loadExam(page, ctx.url)
      expect(await getIntegerValue(page, 3)).toBe(10)
    })
  })

  const expectErrorIndicator = async (text: string) => {
    await page.waitForFunction(
      (text: string) => {
        const errorIndicator = document.querySelector<HTMLDivElement>('.error-indicator')
        return errorIndicator?.innerText.trim() === text
      },
      {},
      text
    )
  }

  const type = (text: string, questionId = DEFAULT_QUESTION_ID) =>
    page.type(`.text-answer[data-question-id="${questionId}"]`, text)

  async function clearInput(questionId = DEFAULT_QUESTION_ID) {
    await page.click(`.text-answer[data-question-id="${questionId}"]`, { clickCount: 3 })
    await page.keyboard.press('Backspace')
  }

  async function expectCharacterCountToBe(expectedCount: number, questionId = DEFAULT_QUESTION_ID) {
    const text = await getTextContent(page, `.text-answer[data-question-id="${questionId}"] ~ .answer-toolbar`)
    const count = Number(/\d+/.exec(text))
    expect(count).toEqual(expectedCount)
  }

  async function setIntegerAnswer(page: Page, questionId: number, value: number): Promise<void> {
    await page.type(`input.text-answer--integer[data-question-id="${questionId}"]`, value.toString())
    await page.waitForSelector('.save-indicator-text--saved')
  }

  async function getIntegerValue(page: Page, questionId: number): Promise<number | undefined> {
    return page
      .$eval(`input.text-answer--integer[data-question-id="${questionId}"]`, e => Number(e.value))
      .catch(() => undefined)
  }

  const expectToBeSaved = () => page.waitForSelector('.save-indicator-text--saved')

  const expectNotToBeSaved = () => page.waitForSelector('.save-indicator-text--saved', { hidden: true })

  const expectSaveIndicatorNotToExist = () => page.waitForSelector('.save-indicator', { hidden: true })

  const expectErrorIndicatorToDisappear = () => page.waitForSelector('.error-indicator', { hidden: true })
})
