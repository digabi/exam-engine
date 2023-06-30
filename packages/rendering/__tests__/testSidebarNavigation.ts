import { resolveExam } from '@digabi/exam-engine-exams'
import { PreviewContext, previewExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { initPuppeteer, loadExam } from './puppeteerUtils'

describe('testSidebarNavigation.ts — Sidebar navigation functionality', () => {
  const createPage = initPuppeteer()
  let page: Page
  let ctx: PreviewContext

  beforeAll(async () => {
    ctx = await previewExam(resolveExam('GE/GE.xml'))
    page = await createPage()
  })

  afterAll(async () => {
    await ctx.close()
  })

  it('shows an exam error when exam has too many questions answered', async () => {
    await loadExam(page, ctx.url)

    const errorMarkLocator = '.sidebar-toc-container .error-mark.exam'
    let errorMark = await page.$(errorMarkLocator)
    expect(errorMark).toBeFalsy()

    await type('testivastaus', 21)
    await type('testivastaus', 23)
    await type('testivastaus', 26)
    await type('testivastaus', 32)
    await type('testivastaus', 37)
    await type('testivastaus', 41)
    errorMark = await page.waitForSelector(errorMarkLocator)
    expect(errorMark).toBeTruthy()
  })

  it('shows a section error when section has too many questions answered', async () => {
    await loadExam(page, ctx.url)

    const errorMarkLocator = '.sidebar-toc-container li[data-section-id="2"] .error-mark'

    await type('testivastaus', 21)
    await type('testivastaus', 23)
    let errorMark = await page.$(errorMarkLocator)
    expect(errorMark).toBeFalsy()

    await type('testivastaus', 26)
    errorMark = await page.waitForSelector(errorMarkLocator)
    expect(errorMark).toBeTruthy()
  })

  it('navigates to question when clicking on it in sidebar', async () => {
    await loadExam(page, ctx.url)

    const questionNameInSidebar = '.sidebar-toc-container li[data-list-number="6."]'
    const questionInExam = '.e-exam #question-title-6'
    const questionSelector = await page.waitForSelector(questionInExam)

    expect(await questionSelector?.isIntersectingViewport()).not.toBe(true)
    await page.click(questionNameInSidebar)
    expect(await questionSelector?.isIntersectingViewport()).toBe(true)
  })

  const type = (text: string, questionId = 89) => page.type(`.text-answer[data-question-id="${questionId}"]`, text)
})
