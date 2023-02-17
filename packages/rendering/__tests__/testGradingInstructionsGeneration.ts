import { resolveExam } from '@digabi/exam-engine-exams'
import { createOfflineExam } from '@digabi/exam-engine-rendering'
import path from 'path'
import { Page } from 'puppeteer'
import tmp from 'tmp-promise'
import { getPageAndRequestErrors, initPuppeteer } from './puppeteerUtils'

describe('testGradingInstructionsGeneration.ts - grading instructions generation', () => {
  const createPage = initPuppeteer()
  let page: Page
  let gradingInstructionHtmlFile: string

  beforeAll(async () => {
    const tmpdir = await tmp.dir().then((r) => r.path)
    const [outputDirectory] = await createOfflineExam(resolveExam('A_E/A_E.xml'), tmpdir, {
      type: 'grading-instructions',
    })
    gradingInstructionHtmlFile = path.resolve(outputDirectory, 'grading-instructions.html')
    page = await createPage()
  })

  it('renders grading instruction page without errors', async () => {
    await expectToRenderWithoutErrors(gradingInstructionHtmlFile)
  })

  async function expectToRenderWithoutErrors(filename: string) {
    const { requestErrors, pageErrors } = await getPageAndRequestErrors(page, filename)
    expect(requestErrors).toEqual([])
    expect(pageErrors).toEqual([])
  }
})
