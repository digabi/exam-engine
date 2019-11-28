'use strict'

import chai from 'chai'
import chaiJestDiff from 'chai-jest-diff'
import path from 'path'
import { assertEqualsExamFixture, listExams } from '../fixtures'
import createTestServer, { CloseFunction } from './createTestServer'
import * as utils from './domUtils'

chai.use(chaiJestDiff)

describe('testExamRendering.ts - Exam rendering', function() {
  utils.initSuite(this, 300000)

  for (const exam of listExams()) {
    describe(path.basename(exam), () => {
      let close: CloseFunction
      let url: string
      before('start webpack-dev-server', async () => {
        ;[url, close] = await createTestServer(exam)
      })

      after('stop webpack-dev-server', async () => {
        await close()
      })

      it('exam page is rendered correctly', async () => {
        await rendersExpectedHtmlContent(exam, url, 'rendering-results.html')
      })

      it('attachment page is rendered correctly', async () => {
        await rendersExpectedHtmlContent(exam, url + '/attachments', 'attachments-rendering-results.html')
      })
    })
  }
})

async function rendersExpectedHtmlContent(exam: string, url: string, fixture: string) {
  const page = utils.getCurrentPage()
  await page.goto(url, { waitUntil: 'networkidle0' })
  const languages = await page.$$eval('.language-selector__language', els => els.map(e => e.textContent!.trim()))

  for (const language of languages) {
    await page.setCookie({
      url,
      name: 'language',
      value: language
    })
    await page.goto(url, { waitUntil: 'networkidle0' })
    const actualHtml = await utils.getOuterHtml('.e-exam')
    await assertEqualsExamFixture(exam, language, fixture, actualHtml)
  }
}
