import { Page } from 'puppeteer'
import { resolveExam } from '@digabi/mexamples'
import createTestServer, { CloseFunction } from './createTestServer'
import { getCurrentPage } from './domUtils'

describe('testCasTransition.ts - Allowing CAS software in a math exam', function() {
  this.timeout(30000)

  let url: string
  let close: CloseFunction
  let page: Page

  before('Start server', async () => {
    ;[url, close] = await createTestServer(resolveExam('M/M.xml'))
    page = await getCurrentPage()
  })

  after('Close server', async () => {
    await close()
  })

  it('hides questions of the first section after clicking enable CAS button', async () => {
    await page.goto(url, { waitUntil: 'networkidle0' })

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
        const element = document.querySelector('.exam-question')
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
