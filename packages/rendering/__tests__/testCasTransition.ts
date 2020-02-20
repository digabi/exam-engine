import { resolveExam } from '@digabi/exam-engine-exams'
import { PreviewContext, previewExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { initPuppeteer } from './puppeteerUtils'

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
    await page.goto(ctx.url)
    await page.waitForSelector('.e-exam')

    await assertQuestionVisibility(true)
    await clickToggleCas(true)
    await assertQuestionVisibility(false)
  })

  it('allows the user to cancel the operation', async () => {
    await clickToggleCas(false)
    await assertQuestionVisibility(true)
  })

  it('after waiting for the countdown to finish, it enables CAS software and locks answers for the first section', async () => {
    await clickToggleCas(true)
    await assertQuestionVisibility(false)
    await assertFirstSectionReturned()
  })

  async function clickToggleCas(allowed: boolean) {
    return page.click(allowed ? '#allow-cas' : '#allow-cas-cancelled')
  }

  async function assertQuestionVisibility(visible: boolean) {
    await page.waitFor(
      innerVisible => {
        const element = document.getElementById('1')
        return innerVisible ? element != null : element == null
      },
      undefined,
      visible
    )
  }

  async function assertFirstSectionReturned() {
    await page.waitFor(() => {
      const maybeNotification = document.querySelector('.e-cas-controls .notification')
      if (maybeNotification) {
        return maybeNotification.textContent!.trim() === 'A-osa palautettu'
      }
    })
  }
})
