import fsP from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { resolveExam } from '@digabi/exam-engine-exams'
import { createOfflineExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { getPageAndRequestErrors, initPuppeteer } from './puppeteerUtils'

describe('testOfflineGeneration.ts - Offline version generation', () => {
  const createPage = initPuppeteer()
  let page: Page
  let examHtmlFile: string
  let attachmentsHtmlFile: string
  let tmpdir: string

  beforeAll(async () => {
    tmpdir = await fsP.mkdtemp(path.join(os.tmpdir(), 'offline-exam-'))
    const [outputDirectory] = await createOfflineExam(resolveExam('A_E/A_E.xml'), tmpdir)
    examHtmlFile = path.resolve(outputDirectory, 'index.html')
    attachmentsHtmlFile = path.resolve(outputDirectory, 'attachments/index.html')
    page = await createPage()
  })

  afterAll(async () => {
    await fsP.rm(tmpdir, { recursive: true, force: true })
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
