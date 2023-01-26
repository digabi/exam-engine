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
    await clearInput(90)
    await expectErrorIndicatorToDisappear()
  })

  it('shows the error indicator when answer is too long', async () => {
    await loadExam(page, ctx.url)
    await expectErrorIndicatorToDisappear()
    await type('o'.repeat(241), 89)
    await expectErrorIndicator('Tehtävä 20.1: Vastaus on liian pitkä.')
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
