import { resolveExam } from '@digabi/exam-engine-exams'
import { PreviewContext, previewExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { initPuppeteer, loadExam } from './puppeteerUtils'

const VISIBLE = { visible: true }
const HIDDEN = { hidden: true }
describe('testGrading.ts', () => {
  const createPage = initPuppeteer()
  let page: Page
  let ctx: PreviewContext

  beforeAll(async () => {
    ctx = await previewExam(resolveExam('N/N.xml'))
    page = await createPage()
    await loadExam(page, ctx.url)
    await answer(1, '1234567890987654321')
    await answer(7, 'Duis magna mi, interdum eu mattis vel, ultricies a nibh. Duis tortor tortor, ')
    await page.keyboard.press('Enter')
    await answer(7, 'imperdiet eget fermentum eget, rutrum ac lorem. Ut eu enim risus. Donec sed eros orci. ')
    await page.keyboard.press('Enter')
    await answer(7, 'Aenean vel eros lobortis, dignissim magna nec, vulputate quam. Morbi non metus consequat, ')
    await page.keyboard.press('Enter')
    await answer(7, 'pellentesque tellus iaculis, iaculis dolor. Vivamus vel feugiat neque, sit amet varius turpis.')
    await page.keyboard.press('Enter')
    await answer(7, 'Aliquam non dapibus augue, interdum dapibus tellus. Ut at est eu ex pharetra ultricies')
    await page.keyboard.press('Enter')
    await page.click('button::-p-text(Σ Lisää kaava)', {})
    await page.keyboard.type('1/x+2x^2')
    await page.keyboard.press('Escape')

    await page.waitForSelector('.save-indicator-text--saved')
  })

  beforeEach(async () => {
    await page.goto(`${ctx.url}/fi-FI/normal/grading`)
    await page.waitForSelector('.e-grading-answer')
  })

  afterAll(async () => {
    await ctx.close()
  })

  it('renders single line answer with character without warning and annotate', async () => {
    await navigateToAnswer('1.1')
    await expectText('.e-grading-answer-length', 'Vastauksen pituus: 19 merkkiä.')
    await page.waitForSelector('.e-grading-answer-max-length-surplus', HIDDEN)
    await drag(345, 150, 500, 150)
    await page.waitForSelector('.e-grading-answer-add-annotation', VISIBLE)
    await page.keyboard.type('+1p.')
    await page.keyboard.press('Enter')
    await expectAnnotationMessages(['+1', '+1p.'])
  })

  it('renders character count with surplus warning', async () => {
    await navigateToAnswer('2')
    const surplusText = 'Vastauksen enimmäispituus 100 merkkiä ylittyy 268 %.'
    await expectText('.e-grading-answer-length', `Vastauksen pituus: 368 merkkiä.${surplusText}`)
    await expectText('.e-grading-answer-max-length-surplus', surplusText)
  })

  it('creates and modifies annotations', async () => {
    await navigateToAnswer('2')
    // Small timeout here to ensure that the text is actually visible in the ui. This is really flaky without the timeout
    await new Promise(resolve => setTimeout(resolve, 100))
    await drag(300, 210, 502, 210)
    await page.waitForSelector('.e-grading-answer-add-annotation', VISIBLE)
    await page.keyboard.type('first annotation message')
    await page.keyboard.press('Enter')
    await page.mouse.reset()
    await page.waitForSelector('.e-grading-answer-add-annotation', HIDDEN)
    await expectText('.e-annotation--censoring', 'vel eros lobortis, dignissim ')
    await expectAnnotationMessages(['+1', 'first annotation message'])

    await page.mouse.move(500, 210)
    await page.waitForSelector('.e-grading-answer-tooltip', VISIBLE)
    await page.click('.e-grading-answer-tooltip-label')
    await page.waitForSelector('.e-grading-answer-add-annotation', VISIBLE)
    await page.keyboard.type('2')
    await page.keyboard.press('Enter')
    await expectAnnotationMessages(['+1', 'first annotation message2'])
    await page.mouse.reset()
    await page.waitForSelector('.e-grading-answer-tooltip', HIDDEN)
  })

  it('removes annotations', async () => {
    await navigateToAnswer('2')
    // Small timeout here to ensure that the text is actually visible in the ui. This is really flaky without the timeout
    await new Promise(resolve => setTimeout(resolve, 100))
    await drag(300, 210, 502, 210)
    await page.waitForSelector('.e-grading-answer-add-annotation', VISIBLE)
    await page.keyboard.type('second annotation message')
    await page.keyboard.press('Enter')
    await page.mouse.reset()
    await page.waitForSelector('.e-grading-answer-add-annotation', HIDDEN)
    await expectText('.e-annotation--censoring', 'vel eros lobortis, dignissim ')
    await expectAnnotationMessages(['+1', 'second annotation message'])

    await page.hover('.e-annotation--censoring')
    await page.waitForSelector('.e-grading-answer-tooltip', VISIBLE)
    await page.click('.e-grading-answer-tooltip-remove')
    await expectAnnotationMessages(['+1'])
  })

  async function expectText(selector: string, text: string) {
    const element = await page.waitForSelector(selector, VISIBLE)
    const textContent = await element?.evaluate(el => el.textContent)
    expect(textContent).toBe(text)
  }
  async function expectAnnotationMessages(expected: string[]) {
    const annotationList = await page.waitForSelector('.e-annotation-list', VISIBLE)
    const listItems = await annotationList?.evaluate(el =>
      Array.from(el.querySelectorAll('li')).map(li => li.textContent)
    )
    expect(listItems).toEqual(expected)
  }

  async function drag(x1: number, y1: number, x2: number, y2: number) {
    await page.mouse.move(x1, y1)
    await page.mouse.down()
    await page.mouse.move(x2, y2)
    await page.mouse.up()
  }
  async function answer(questionId: number, text: string) {
    await page.type(`.text-answer[data-question-id="${questionId}"]`, text)
  }
  async function navigateToAnswer(displayNumber: string) {
    const navi = await page.waitForSelector('.grading-navi')
    const button = await navi?.waitForSelector(`text/${displayNumber}`)
    await button?.click()
    await page.waitForSelector('.e-grading-answer', VISIBLE)
  }
})
