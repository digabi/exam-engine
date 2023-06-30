import { resolveExam } from '@digabi/exam-engine-exams'
import { PreviewContext, previewExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { getTextContent, initPuppeteer, loadExam } from './puppeteerUtils'

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
    await type('oikea vastaus', 89)
    await type('oikea vastaus 2', 90)
    await expectErrorIndicator('Tehtävä 20: Vastaa joko kohtaan 20.1 tai 20.2.')

    const questionName = await page.$('.sidebar-toc-container li[data-list-number="20."]')
    const className = await (await questionName?.getProperty('className'))?.jsonValue()
    expect(className).toContain('error')

    await clearInput(90)
    await expectErrorIndicatorToDisappear()

    const classNameThen = await (await questionName?.getProperty('className'))?.jsonValue()
    expect(classNameThen).not.toContain('error')
  })

  it('shows the error indicator when answer is too long', async () => {
    await loadExam(page, ctx.url)
    await expectErrorIndicatorToDisappear()
    await type('o'.repeat(241), 89)
    await expectErrorIndicator('Tehtävä 20.1: Vastaus on liian pitkä.')
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

  it('ESC exits writer mode', async () => {
    await loadExam(page, ctx.url)

    const body = await page.$('body')
    const fullScreenSelector = 'div[data-full-screen-id="1.2"]'

    await openWriterMode(page)
    await page.keyboard.press('Escape')
    const bodyClass = await (await body?.getProperty('className'))?.jsonValue()
    expect(bodyClass).not.toContain('writer-mode')

    const fullScreen = await page.$(fullScreenSelector)
    expect(fullScreen).toBeFalsy()
  })

  const openWriterMode = async (page: Page) => {
    await page.click('.text-answer[data-question-id="2"] + .expand')

    const body = await page.$('body')
    const fullScreenSelector = 'div[data-full-screen-id="1.2"]'

    const bodyClass = await (await body?.getProperty('className'))?.jsonValue()
    expect(bodyClass).toContain('writer-mode')

    const fullScreen = await page.$(fullScreenSelector)
    expect(fullScreen).toBeTruthy()
  }

  it('a text answer indicator has correct state in side navigation', async () => {
    await loadExam(page, ctx.url)
    await clearInput(90)
    const indicator = await page.$('.sidebar-toc-container div[data-indicator-id="90"]')

    const className = await (await indicator?.getProperty('className'))?.jsonValue()
    const indicatorValue = await (await indicator?.getProperty('innerHTML'))?.jsonValue()
    await type('testivastaus', 90)
    const classNameThen = await (await indicator?.getProperty('className'))?.jsonValue()
    const indicatorValueThen = await (await indicator?.getProperty('innerHTML'))?.jsonValue()
    await clearInput(90)
    const classNameFinally = await (await indicator?.getProperty('className'))?.jsonValue()
    const indicatorValueFinally = await (await indicator?.getProperty('innerHTML'))?.jsonValue()

    expect(className).not.toContain('ok')
    expect(indicatorValue).toContain('')
    expect(classNameThen).toContain('ok')
    expect(indicatorValueThen).toContain('12')
    expect(classNameFinally).not.toContain('ok')
    expect(indicatorValueFinally).toContain('')
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

  const type = (text: string, questionId = 89) => page.type(`.text-answer[data-question-id="${questionId}"]`, text)

  async function clearInput(questionId = 89) {
    await page.click(`.text-answer[data-question-id="${questionId}"]`, { clickCount: 3 })
    await page.keyboard.press('Backspace')
  }

  async function expectCharacterCountToBe(expectedCount: number, questionId = 89) {
    const text = await getTextContent(page, `.text-answer[data-question-id="${questionId}"] ~ .answer-toolbar`)
    const count = Number(/\d+/.exec(text))
    expect(count).toEqual(expectedCount)
  }

  const expectToBeSaved = () => page.waitForSelector('.save-indicator-text--saved')

  const expectNotToBeSaved = () => page.waitForSelector('.save-indicator-text--saved', { hidden: true })

  const expectSaveIndicatorNotToExist = () => page.waitForSelector('.save-indicator', { hidden: true })

  const expectErrorIndicatorToDisappear = () => page.waitForSelector('.error-indicator', { hidden: true })
})
