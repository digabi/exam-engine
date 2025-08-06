import { resolveExam } from '@digabi/exam-engine-exams'
import { PreviewContext, previewExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { initPuppeteer, loadExam } from './puppeteerUtils'

describe('testCasTransition.ts - Allowing CAS software in a math exam', () => {
  const createPage = initPuppeteer()
  let page: Page
  let ctx: PreviewContext

  beforeAll(async () => {
    ctx = await previewExam(resolveExam('N/N.xml'), {
      casCountdownDurationSeconds: 2
    })
    page = await createPage()
  })

  afterAll(async () => {
    await ctx.close()
  })

  it('hides questions of the first section after clicking enable CAS button', async () => {
    await loadExam(page, ctx.url)
    await expectQuestionToBeVisible(true)
    await clickToggleCas(true)
    await expectQuestionToBeVisible(false)
  })

  it('allows the user to cancel the operation', async () => {
    await clickToggleCas(false)
    await expectQuestionToBeVisible(true)
  })

  it('part A includes a button for proceeding to examine answers', () => {
    expect(page.locator('.e-cas-controls .goto-examine-answers')).toBeTruthy()
  })

  it('after waiting for the countdown to finish, it enables CAS software and locks answers for the first section', async () => {
    await clickToggleCas(true)
    await expectQuestionToBeVisible(false)
    await assertFirstSectionReturned()
  })

  async function clickToggleCas(allowed: boolean) {
    return page.click(allowed ? '#allow-cas' : '#allow-cas-cancelled')
  }

  async function expectQuestionToBeVisible(visible: boolean) {
    await page.waitForFunction(
      // FIXME: Remove explicit type after Puppeteer 7.x has added better page.waitForFunction types.
      // https://github.com/puppeteer/puppeteer/issues/6884
      (innerVisible: boolean) => {
        const element = document.getElementById('question-nr-1')
        return innerVisible ? element != null : element == null
      },
      undefined,
      visible
    )
  }

  async function assertFirstSectionReturned() {
    await page.waitForFunction(() => {
      const maybeNotification = document.querySelector('.e-cas-controls .notification')
      if (maybeNotification) {
        return maybeNotification.textContent.trim() === 'A-osa palautettu'
      }
    })
  }
})
