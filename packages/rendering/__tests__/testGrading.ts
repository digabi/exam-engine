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
    await answer(1, 'Short answer message content')
    await answer(
      7,
      'Duis magna mi, interdum eu mattis vel, ultricies a nibh. Duis tortor tortor, imperdiet eget fermentum eget, rutrum ac lorem. Ut eu enim risus. Donec sed eros orci. Aenean vel eros lobortis, dignissim magna nec, vulputate quam. Morbi non metus consequat, pellentesque tellus iaculis, iaculis dolor. Vivamus vel feugiat neque, sit amet varius turpis. Aliquam non dapibus augue, interdum dapibus tellus. Ut at est eu ex pharetra ultricies'
    )
    await page.click('[data-js="newEquation"]')
    await page.keyboard.type('1/x+2x^2')
    await page.keyboard.press('Escape')
    // await page.type(`.text-answer[data-question-id="${7}"]`, text)

    await page.waitForSelector('.save-indicator-text--saved')
    await page.goto(ctx.url + '/fi-FI/normal/grading')
    await page.waitForSelector('.e-grading-answer')
  })

  afterAll(async () => {
    await ctx.close()
  })

  it('renders single line answer with character without warning and annotate', async () => {
    await navigateToAnswer('1.1')
    await expectText('.e-grading-answer-length', 'Vastauksen pituus: 25 merkkiä.')
    await page.waitForSelector('.e-grading-answer-max-length-surplus', HIDDEN)
    await drag(245, 140, 300, 140)
    await page.waitForSelector('.e-grading-answer-add-annotation', VISIBLE)
    await page.keyboard.type('+1p.')
    await page.keyboard.press('Enter')
    await expectAnnotationMessages(['+1', '+1p.'])
  })

  it('renders character count with surplus warning', async () => {
    await navigateToAnswer('2')
    const surplusText = 'Vastauksen enimmäispituus 100 merkkiä ylittyy 268 %.'
    await expectText('.e-grading-answer-length', 'Vastauksen pituus: 368 merkkiä.' + surplusText)
    await expectText('.e-grading-answer-max-length-surplus', surplusText)
  })

  it('creates annotations, modifies and removes them', async () => {
    await navigateToAnswer('2')
    await drag(200, 200, 400, 200)
    await page.waitForSelector('.e-grading-answer-add-annotation', VISIBLE)
    await page.keyboard.type('first annotation message')
    await page.keyboard.press('Enter')
    await page.waitForSelector('.e-grading-answer-add-annotation', HIDDEN)
    await expectText('.e-annotation--censoring', 'sque tellus iaculis, iaculis d')
    await expectAnnotationMessages(['+1', 'first annotation message'])

    await page.mouse.move(300, 200)
    await page.waitForSelector('.e-grading-answer-tooltip', VISIBLE)
    await page.click('.e-grading-answer-tooltip-label')
    await page.waitForSelector('.e-grading-answer-add-annotation', VISIBLE)
    await page.keyboard.sendCharacter('2')
    await page.keyboard.press('Enter')
    await expectAnnotationMessages(['+1', 'first annotation message2'])

    await page.mouse.move(300, 200)
    await page.click('.e-grading-answer-tooltip-remove')
    await expectAnnotationMessages(['+1'])

    await drag(510, 230, 550, 250)
    await page.waitForSelector('.e-grading-answer-add-annotation', VISIBLE)
    await page.keyboard.type('img annotation msg')
    await page.keyboard.press('Enter')
    await page.waitForSelector('.e-grading-answer-add-annotation', HIDDEN)
    await page.waitForSelector('.e-annotation-wrapper .e-annotation--censoring', VISIBLE)
    await expectAnnotationMessages(['+1', 'img annotation msg'])
  })

  async function expectText(selector: string, text: string) {
    const element = await page.waitForSelector(selector, VISIBLE)
    const textContent = await element?.evaluate((el) => el.textContent)
    expect(textContent).toBe(text)
  }
  async function expectAnnotationMessages(expected: string[]) {
    const annotationList = await page.waitForSelector('.e-annotation-list', VISIBLE)
    const listItems = await annotationList?.evaluate((el) =>
      Array.from(el.querySelectorAll('li')).map((li) => li.textContent)
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
    const button = await navi?.waitForSelector('text/' + displayNumber)
    await button?.click()
  }
})
