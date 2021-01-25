import { resolveExam } from '@digabi/exam-engine-exams'
import { PreviewContext, previewExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { delay, expectElementNotToExist, getTextContent, initPuppeteer, loadExam } from './puppeteerUtils'

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
    await delay(2000)
    await expectToBeSaved()

    await type(' kaikille')
    await expectNotToBeSaved()
    await delay(2000)
    await expectToBeSaved()

    await loadExam(page, ctx.url)
    await expectToBeSaved()
  })

  it('updates the error indicator after a delay when too many answers', async () => {
    await loadExam(page, ctx.url)
    await expectErrorIndicatorNotToExist()
    await type('oikea vastaus', 1)
    await type('oikea vastaus 2', 2)
    await type('kokeilu', 3)
    await delay(2000)
    const errorText = await getTextContent(page, '.error-indicator')
    expect(errorText).toEqual('Osa 1: Vastaa joko tehtävään 1 tai 2.')
    await clearInput(3)
    await delay(2000)
    await expectErrorIndicatorNotToExist()
  })

  const type = (text: string, index = 1) => page.type(`.text-answer[data-question-id="${index}"]`, text)

  async function clearInput(index = 1) {
    await page.click(`.text-answer[data-question-id="${index}"]`, { clickCount: 3 })
    await page.keyboard.press('Backspace')
  }

  async function expectCharacterCountToBe(expectedCount: number) {
    const text = await getTextContent(page, '.answer-toolbar__answer-length')
    const count = Number(/\d+/.exec(text))
    expect(count).toEqual(expectedCount)
  }

  const expectToBeSaved = () => page.$eval('.save-indicator-text--saved', (e) => e)

  const expectNotToBeSaved = () => expectElementNotToExist(page, '.save-indicator-text--saved')

  const expectSaveIndicatorNotToExist = () => expectElementNotToExist(page, '.save-indicator')

  const expectErrorIndicatorNotToExist = () => expectElementNotToExist(page, '.error-indicator')
})
