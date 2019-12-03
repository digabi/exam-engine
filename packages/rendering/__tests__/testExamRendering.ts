'use strict'

import { CloseFunction, previewExam } from '@digabi/exam-engine-rendering'
import { listExams } from '@digabi/mexamples'
import wrap from 'jest-snapshot-serializer-raw'
import path from 'path'
import { Page } from 'puppeteer'
import { getOuterHtml, initPuppeteer } from './puppeteerUtils'

describe('testExamRendering.ts - Exam rendering', () => {
  const createPage = initPuppeteer()
  let page: Page

  beforeAll(async () => {
    page = await createPage()
  })

  for (const exam of listExams()) {
    describe(path.basename(exam), () => {
      let close: CloseFunction
      let url: string
      beforeAll(async () => {
        ;[url, close] = await previewExam(exam, { deterministicRendering: true })
      })

      afterAll(async () => {
        await close()
      })

      it('exam page is rendered correctly', async () => {
        await rendersExpectedHtmlContent(url)
      })

      it('attachment page is rendered correctly', async () => {
        await rendersExpectedHtmlContent(url + '/attachments')
      })
    })
  }

  async function rendersExpectedHtmlContent(url: string) {
    await page.goto(url, { waitUntil: 'networkidle0' })
    const languages = await page.$$eval('.toolbar__item--language', els => els.map(e => e.textContent!.trim()))

    for (const language of languages) {
      await page.setCookie({
        url,
        name: 'language',
        value: language
      })
      await page.goto(url, { waitUntil: 'networkidle0' })
      const actualHtml = await getOuterHtml(page, '.e-exam')
      await expect(wrap(actualHtml)).toMatchSnapshot()
    }
  }
})
