import { resolveExam } from '@digabi/exam-engine-exams'
import { PreviewContext, previewExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { initPuppeteer, loadExam } from './puppeteerUtils'

describe('testChoiceAnswer.ts - choice answer interactions', () => {
  const createPage = initPuppeteer()
  let page: Page
  let ctx: PreviewContext

  beforeAll(async () => {
    ctx = await previewExam(resolveExam('SC/SC.xml'))
    page = await createPage()
  })

  afterAll(async () => {
    await ctx.close()
    await page.close()
  })

  it('selects no answer by default', async () => {
    await loadExam(page, ctx.url)
    expect(await getRadioButtonValue(page, 1)).toBeUndefined()
  })

  it('remembers the choices after reloading', async () => {
    await loadExam(page, ctx.url)

    await setChoiceAnswer(page, 1, '91')
    await loadExam(page, ctx.url)
    expect(await getRadioButtonValue(page, 1)).toEqual('91')

    await setChoiceAnswer(page, 1, '93')
    await loadExam(page, ctx.url)
    expect(await getRadioButtonValue(page, 1)).toEqual('93')
  })
})

async function getRadioButtonValue(page: Page, questionId: number): Promise<string | undefined> {
  return page
    .$eval(`.e-radio-button[name="${questionId}"]:checked`, (e) => (e as HTMLInputElement).value)
    .catch(() => undefined)
}

async function setChoiceAnswer(page: Page, questionId: number, value: string): Promise<void> {
  await page.click(`.e-radio-button[name="${questionId}"][value="${value}"]`)
  await page.waitForSelector('.save-indicator-text--saved')
}
