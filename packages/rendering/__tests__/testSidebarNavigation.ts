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

      await type(page, 'testivastaus', 21)
      await type(page, 'testivastaus', 23)
      await type(page, 'testivastaus', 26)
      await type(page, 'testivastaus', 32)
      await type(page, 'testivastaus', 37)
      await type(page, 'testivastaus', 41)
      errorMark = await page.waitForSelector(errorMarkLocator)
      expect(errorMark).toBeTruthy()
    })

    it('shows a section-level error when section has too many questions answered', async () => {
      // only two answers are allowed in questions 2 — 4

      await loadExam(page, ctx.url)

      const errorMarkLocator = '.sidebar-toc-container li[data-section-id="2"] .error-mark'

      await type(page, 'testivastaus', 21) // 2.1
      await type(page, 'testivastaus', 23) // 3.1
      let errorMark = await page.$(errorMarkLocator)
      expect(errorMark).toBeNull()

      await type(page, 'testivastaus', 26) // 4.1
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

      await type(page, 'testivastaus', 97)
      await expectNoError(indicator97)
      await expectNoError(indicator98)
      await expectNoError(indicator99)

      await type(page, 'testivastaus', 98)
      expect(await page.waitForSelector(`${indicator97}.error`)).toBeTruthy()
      expect(await page.waitForSelector(`${indicator98}.error`)).toBeTruthy()
      await expectNoError(indicator99)

      await type(page, 'testivastaus', 99)
      expect(await page.waitForSelector(`${indicator97}.error`)).toBeTruthy()
      expect(await page.waitForSelector(`${indicator98}.error`)).toBeTruthy()
      expect(await page.waitForSelector(`${indicator99}.error`)).toBeTruthy()
    })

    const expectNoError = async (selector: string) => {
      const hasError = await page.$eval(selector, e => e.className.includes('error'))
      expect(hasError).toBeFalsy()
    }
  })
})

const type = async (page: Page, text: string, questionId = 89) => {
  const selector = `.text-answer[data-question-id="${questionId}"]`
  await page.locator(selector).fill(text)
}
