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
    const surplus = await page.waitForSelector('.e-grading-answer-max-length-surplus')
    const text = await surplus?.evaluate((el) => el.textContent)
    expect(text).toBe('Vastauksen enimmäispituus 100 merkkiä ylittyy 268 %.')
  })

  it('creates text annotation', async () => {
    await page.mouse.move(200, 200)
    await page.mouse.down()
    await page.mouse.move(400, 200)
    await page.mouse.up()
    await page.waitForSelector('.e-grading-answer-popup')
    await page.keyboard.type('first annotation message')
    await page.keyboard.press('Enter')
    const annotation = await page.waitForSelector('.e-annotation--censoring')
    const annotationText = await annotation?.evaluate((el) => el.textContent)
    expect(annotationText).toBe('sque tellus iaculis, iaculis d')
    const annotationList = await page.waitForSelector('.e-annotation-list')
    const text = await annotationList?.evaluate((el) => el.textContent)
    expect(text).toBe('Valmistavan arvostelun merkinnät+1Sensorin merkinnätfirst annotation message')
  })
})
