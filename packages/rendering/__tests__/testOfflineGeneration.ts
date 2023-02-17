import { resolveExam } from '@digabi/exam-engine-exams'
import { createOfflineExam } from '@digabi/exam-engine-rendering'
import path from 'path'
import { Page } from 'puppeteer'
import tmp from 'tmp-promise'
import { getPageAndRequestErrors, initPuppeteer } from './puppeteerUtils'

describe('testOfflineGeneration.ts - Offline version generation', () => {
  const createPage = initPuppeteer()
  let page: Page
  let examHtmlFile: string
  let attachmentsHtmlFile: string

  beforeAll(async () => {
    const tmpdir = await tmp.dir().then((r) => r.path)
    const [outputDirectory] = await createOfflineExam(resolveExam('A_E/A_E.xml'), tmpdir)
    examHtmlFile = path.resolve(outputDirectory, 'index.html')
    attachmentsHtmlFile = path.resolve(outputDirectory, 'attachments/index.html')
    page = await createPage()
  })

  it('renders exam page without errors', async () => {
    await expectToRenderWithoutErrors(examHtmlFile)
  })

  it('renders attachment page without errors', async () => {
    await expectToRenderWithoutErrors(attachmentsHtmlFile)
  })

  async function expectToRenderWithoutErrors(filename: string) {
    const { requestErrors, pageErrors } = await getPageAndRequestErrors(page, filename)
    expect(requestErrors).toEqual([])
    expect(pageErrors).toEqual([])
  }
})
