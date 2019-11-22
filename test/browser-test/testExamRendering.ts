'use strict'

import chai, { assert } from 'chai'
import chaiJestDiff from 'chai-jest-diff'
import { readFixture, resolveFixture, writeFixture } from '../fixtures'
import createTestServer, { CloseFunction } from './createTestServer'
import * as utils from './domUtils'

interface TestResultData {
  language: string
  fixturePath: string
}

interface TestData {
  exam: string
  xmlPath: string
  expectedResults: TestResultData[]
  expectedAttachmentsResults: TestResultData[]
}
chai.use(chaiJestDiff)

describe('testExamRendering.ts - Exam rendering', function() {
  utils.initSuite(this, 300000)

  describe(
    'A_X',
    createRenderingTest({
      exam: 'A_X',
      xmlPath: resolveFixture('exams/A_X/A_X.xml'),
      expectedResults: [
        {
          language: 'fi-FI',
          fixturePath: resolveFixture('test/fixtures/A_X/A_X_fi-FI.html')
        }
      ],
      expectedAttachmentsResults: [
        {
          language: 'fi-FI',
          fixturePath: resolveFixture('test/fixtures/A_X/A_X_fi-FI_attachments.html')
        }
      ]
    })
  )

  describe(
    'FF',
    createRenderingTest({
      exam: 'FF',
      xmlPath: resolveFixture('exams/FF/FF.xml'),
      expectedResults: [
        {
          language: 'fi-FI',
          fixturePath: resolveFixture('test/fixtures/FF/FF_fi-FI.html')
        },
        {
          language: 'sv-FI',
          fixturePath: resolveFixture('test/fixtures/FF/FF_sv-FI.html')
        }
      ],
      expectedAttachmentsResults: [
        {
          language: 'fi-FI',
          fixturePath: resolveFixture('test/fixtures/FF/FF_fi-FI_attachments.html')
        },
        {
          language: 'sv-FI',
          fixturePath: resolveFixture('test/fixtures/FF/FF_sv-FI_attachments.html')
        }
      ]
    })
  )

  describe(
    'EA',
    createRenderingTest({
      exam: 'EA',
      xmlPath: resolveFixture('exams/EA/EA.xml'),
      expectedResults: [
        {
          language: 'fi-FI',
          fixturePath: resolveFixture('test/fixtures/EA/EA_fi-FI.html')
        }
      ],
      expectedAttachmentsResults: []
    })
  )

  describe(
    'MexDocumentation',
    createRenderingTest({
      exam: 'TEST',
      xmlPath: resolveFixture('exams/MexDocumentation/MexDocumentation.xml'),
      expectedResults: [
        {
          language: 'fi-FI',
          fixturePath: resolveFixture('test/fixtures/MexDocumentation/MexDocumentation-FI.html')
        }
      ],
      expectedAttachmentsResults: [
        {
          language: 'fi-FI',
          fixturePath: resolveFixture('test/fixtures/MexDocumentation/MexDocumentation-FI_attachments.html')
        }
      ]
    })
  )

  function createRenderingTest(testData: TestData) {
    return () => {
      let close: CloseFunction
      let url: string
      before('start webpack-dev-server', async () => {
        ;[url, close] = await createTestServer(testData.xmlPath)
      })

      after('stop webpack-dev-server', async () => {
        await close()
      })

      it('exam page is rendered correctly', async () => {
        await rendersExpectedHtmlContent(url, testData.exam, testData.expectedResults)
      })

      it('attachment page is rendered correctly', async () => {
        await rendersExpectedHtmlContent(url + '/attachments', testData.exam, testData.expectedAttachmentsResults)
      })
    }
  }

  async function rendersExpectedHtmlContent(url: string, exam: string, expectedResults: TestResultData[]) {
    for (const { language, fixturePath } of expectedResults) {
      const page = utils.getCurrentPage()
      await page.setCookie({
        url,
        name: 'language',
        value: language
      })
      await page.goto(url, { waitUntil: 'networkidle0' })

      const actualHtml = await utils.getOuterHtml('.e-exam')

      if (process.env.OVERWRITE_FIXTURES) {
        await writeFixture(fixturePath, actualHtml)
      }

      const expectedHtml = await readFixture(fixturePath)
      assert.equal(actualHtml, expectedHtml, `${exam} ${language}: HTML mismatch`)
    }
  }
})
