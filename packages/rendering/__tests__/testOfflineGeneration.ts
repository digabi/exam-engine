import { resolveExam } from '@digabi/exam-engine-exams'
import { createOfflineExam } from '@digabi/exam-engine-rendering'
import path from 'path'
import { Page, HTTPRequest } from 'puppeteer'
import tmp from 'tmp-promise'
import { initPuppeteer } from './puppeteerUtils'

describe('testOfflineGeneration.ts - Offline version generation', () => {
  const createPage = initPuppeteer()
  let page: Page
  let examHtmlFile: string
  let attachmentsHtmlFile: string
  let gradingInstructionHtmlFile: string

  beforeAll(async () => {
    const tmpdir = await tmp.dir().then((r) => r.path)
    const [outputDirectory] = await createOfflineExam(resolveExam('A_E/A_E.xml'), tmpdir)
    examHtmlFile = path.resolve(outputDirectory, 'index.html')
    attachmentsHtmlFile = path.resolve(outputDirectory, 'attachments/index.html')
    gradingInstructionHtmlFile = path.resolve(outputDirectory, 'attachments/index.html')
    page = await createPage()
  })

  it('renders exam page without errors', async () => {
    await expectToRenderWithoutErrors(examHtmlFile)
  })

  it('renders attachment page without errors', async () => {
    await expectToRenderWithoutErrors(attachmentsHtmlFile)
  })

  it('renders grading instruction page without errors', async () => {
    await expectToRenderWithoutErrors(gradingInstructionHtmlFile)
  })

  async function expectToRenderWithoutErrors(filename: string) {
    const requestErrors: string[] = []
    const pageErrors: Error[] = []

    // FIXME: Remove explicit type after Puppeteer's types have improved.
    page.on('requestfailed', (req: HTTPRequest) => {
      const errorText = req.failure()!.errorText
      if (errorText !== 'net::ERR_ABORTED') {
        requestErrors.push(req.url())
      }
    })
    page.on('pageerror', (err) => pageErrors.push(err))

    await page.goto('file://' + filename, { waitUntil: 'networkidle0' })
    expect(requestErrors).toEqual([])
    expect(pageErrors).toEqual([])
  }
})
