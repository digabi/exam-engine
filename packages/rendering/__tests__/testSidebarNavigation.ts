import { resolveExam } from '@digabi/exam-engine-exams'
import { PreviewContext, previewExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { initPuppeteer, loadExam } from './puppeteerUtils'

describe('testSidebarNavigation.ts — Sidebar navigation functionality', () => {
  describe('exam and section level errors', () => {
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

    it('shows an exam-level error when exam has too many questions answered', async () => {
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

    it('shows a section-level error when section has too many questions answered', async () => {
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

    it('navigates to subquestion when clicking on it in sidebar', async () => {
      await loadExam(page, ctx.url)

      const subQuestionLinkInSidebar = '.sidebar-toc-container div[data-indicator-id="11"]'
      const questionInExam = 'h4[id="question-title-1.7"]'
      const questionSelector = await page.waitForSelector(questionInExam)

      expect(await questionSelector?.isIntersectingViewport()).not.toBe(true)
      await page.click(subQuestionLinkInSidebar)
      expect(await questionSelector?.isIntersectingViewport()).toBe(true)
    })

    it('navigates to 3rd level subquestion when clicking on it in sidebar', async () => {
      const ctx = await previewExam(resolveExam('SC/SC.xml'))
      const page = await createPage()
      await loadExam(page, ctx.url)

      const subQuestionLinkInSidebar = '.sidebar-toc-container div[data-indicator-id="40"]'
      const questionInExam = 'span[id="question-nr-11.2.2"]'
      const questionSelector = await page.waitForSelector(questionInExam)

      expect(await questionSelector?.isIntersectingViewport()).not.toBe(true)
      await page.click(subQuestionLinkInSidebar)
      expect(await questionSelector?.isIntersectingViewport()).toBe(true)
      await ctx.close()
    })

    const type = (text: string, questionId = 89) => page.type(`.text-answer[data-question-id="${questionId}"]`, text)
  })

  describe('question level errors', () => {
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

    it('shows a question-level error when question has too many subquestions answered', async () => {
      await loadExam(page, ctx.url)

      const indicator97 = '.sidebar-toc-container div[data-indicator-id="97"]'
      const indicator98 = '.sidebar-toc-container div[data-indicator-id="98"]'
      const indicator99 = '.sidebar-toc-container div[data-indicator-id="99"]'

      await type('testivastaus', 97)
      expect(getElement(indicator97)).not.toContain('error')
      expect(getElement(indicator98)).not.toContain('error')
      expect(getElement(indicator99)).not.toContain('error')

      await type('testivastaus', 98)
      expect(await page.waitForSelector(`${indicator97}.error`)).toBeTruthy()
      expect(await page.waitForSelector(`${indicator98}.error`)).toBeTruthy()
      expect(getElement(indicator99)).not.toContain('error')

      await type('testivastaus', 99)
      expect(await page.waitForSelector(`${indicator97}.error`)).toBeTruthy()
      expect(await page.waitForSelector(`${indicator98}.error`)).toBeTruthy()
      expect(await page.waitForSelector(`${indicator99}.error`)).toBeTruthy()
    })

    const getElement = async (selector: string, error = false) =>
      await page.waitForSelector(`${selector}${error ? '.error' : ''}`)

    const type = (text: string, questionId = 89) => page.type(`.text-answer[data-question-id="${questionId}"]`, text)
  })
})
