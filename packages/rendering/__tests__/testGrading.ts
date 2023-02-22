import { resolveExam } from '@digabi/exam-engine-exams'
import { PreviewContext, previewExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { initPuppeteer, loadExam } from './puppeteerUtils'

describe('testGrading.ts', () => {
  const createPage = initPuppeteer()
  let page: Page
  let ctx: PreviewContext

  beforeAll(async () => {
    ctx = await previewExam(resolveExam('N/N.xml'))
    page = await createPage()
    await loadExam(page, ctx.url)
    const questionId = 7
    await page.type(
      `.text-answer[data-question-id="${questionId}"]`,
      'Duis magna mi, interdum eu mattis vel, ultricies a nibh. Duis tortor tortor, imperdiet eget fermentum eget, rutrum ac lorem. Ut eu enim risus. Donec sed eros orci. Aenean vel eros lobortis, dignissim magna nec, vulputate quam. Morbi non metus consequat, pellentesque tellus iaculis, iaculis dolor. Vivamus vel feugiat neque, sit amet varius turpis. Aliquam non dapibus augue, interdum dapibus tellus. Ut at est eu ex pharetra ultricies'
    )
    await page.waitForSelector('.save-indicator-text--saved')
    await page.goto(ctx.url + '/fi-FI/normal/grading')
    await page.waitForSelector('.e-grading-answer')
  })

  afterAll(async () => {
    await ctx.close()
  })

  it('renders surplus warning', async () => {
    await expectText('.e-grading-answer-max-length-surplus', 'Vastauksen enimmäispituus 100 merkkiä ylittyy 268 %.')
  })

  it('creates text annotation', async () => {
    await drag(200, 200, 400, 200)
    await page.waitForSelector('.e-grading-answer-popup')
    await page.keyboard.type('first annotation message')
    await page.keyboard.press('Enter')
    await expectText('.e-annotation--censoring', 'sque tellus iaculis, iaculis d')
    await expectAnnotationMessages(['+1', 'first annotation message'])
  })

  async function expectText(selector: string, text: string) {
    const element = await page.waitForSelector(selector)
    const textContent = await element?.evaluate((el) => el.textContent)
    expect(textContent).toBe(text)
  }
  async function expectAnnotationMessages(expected: string[]) {
    const annotationList = await page.waitForSelector('.e-annotation-list')
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
})
