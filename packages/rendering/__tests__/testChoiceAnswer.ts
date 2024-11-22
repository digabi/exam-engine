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
  })

  it('selects no answer by default', async () => {
    await loadExam(page, ctx.url)
    expect(await getRadioButtonValue(page, 1)).toBeUndefined()
  })

  it('remembers the choices after reloading', async () => {
    await loadExam(page, ctx.url)

    await setChoiceAnswer(page, 1, '105')
    await loadExam(page, ctx.url)
    expect(await getRadioButtonValue(page, 1)).toBe('105')

    await setChoiceAnswer(page, 1, '103')
    await loadExam(page, ctx.url)
    expect(await getRadioButtonValue(page, 1)).toBe('103')
  })

  it('a choice answer indicator has correct state in side navigation', async () => {
    await loadExam(page, ctx.url)
    const indicator = await page.$('.sidebar-toc-container div[data-indicator-id="44"]')

    const className = await (await indicator?.getProperty('className'))?.jsonValue()
    const indicatorValue = await (await indicator?.getProperty('innerHTML'))?.jsonValue()
    await setChoiceAnswer(page, 44, '217')
    const classNameThen = await (await indicator?.getProperty('className'))?.jsonValue()
    const indicatorValueThen = await (await indicator?.getProperty('innerHTML'))?.jsonValue()

    expect(className).not.toContain('ok')
    expect(indicatorValue).toContain('')
    expect(classNameThen).toContain('answer-indicator ok')
    expect(indicatorValueThen).toContain('')
  })
})

async function getRadioButtonValue(page: Page, questionId: number): Promise<string | undefined> {
  return page
    .$eval(`.e-radio-button[name="${questionId}"]:checked`, e => (e as HTMLInputElement).value)
    .catch(() => undefined)
}

async function setChoiceAnswer(page: Page, questionId: number, value: string): Promise<void> {
  await page.click(`.e-radio-button[name="${questionId}"][value="${value}"]`)
  await page.waitForSelector('.save-indicator-text--saved')
}
