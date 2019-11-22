import chai, { assert } from 'chai'
import chaiJestDiff from 'chai-jest-diff'
import { spawn } from 'child-process-promise'
import glob from 'glob-promise'
import tmp from 'tmp-promise'
import * as utils from './domUtils'

chai.use(chaiJestDiff)

describe('testOfflineGeneration.ts - Offline version generation', () => {
  let examHtmlFile: string
  let attachmentsHtmlFile: string

  before('Generate offline exam', async function() {
    this.timeout(120000)
    const outputpath = await tmp.dir().then(r => r.path)
    await spawn('npm', ['run', 'offline', 'exams/MexDocumentation/MexDocumentation.xml', outputpath])
    const outputHtmlFiles = await glob(outputpath + '/*/*.html')
    examHtmlFile = outputHtmlFiles.find(f => f.endsWith('koe.html'))!
    attachmentsHtmlFile = outputHtmlFiles.find(f => f.endsWith('aineisto.html'))!
  })

  it('renders exam page without errors', async function() {
    this.timeout(10000)
    await assertRendersWithoutErrors(examHtmlFile)
  })

  it('renders attachment page without errors', async function() {
    this.timeout(10000)
    await assertRendersWithoutErrors(attachmentsHtmlFile)
  })
})

async function assertRendersWithoutErrors(filename: string) {
  const page = utils.getCurrentPage()
  const requestErrors: string[] = []
  const pageErrors: Error[] = []

  page.on('requestfailed', req => {
    const errorText = req.failure()!.errorText
    if (errorText !== 'net::ERR_ABORTED') {
      requestErrors.push(req.url())
    }
  })
  page.on('pageerror', err => pageErrors.push(err))

  await page.goto('file://' + filename, { waitUntil: 'networkidle0' })
  assert.deepEqual(requestErrors, [], 'Request errors should be empty')
  assert.deepEqual(pageErrors, [], 'Page errors should be empty')
}
