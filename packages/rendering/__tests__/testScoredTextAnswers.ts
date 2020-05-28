import { QuestionId } from '@digabi/exam-engine-core'
import { resolveExam } from '@digabi/exam-engine-exams'
import { PreviewContext, previewExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { initPuppeteer, loadExam } from './puppeteerUtils'

describe('testScoredTextAnswers.ts — Scored text answer interactions', () => {
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

  const firstAnswerId = 81
  const secondAnswerId = 82

  it('highlights the hint when focusing a scored text answer', async () => {
    await loadExam(page, ctx.url)

    await focusAnswer(firstAnswerId)
    await expectAnswerHintToBeHighlighted(firstAnswerId)

    await focusAnswer(secondAnswerId)
    await expectAnswerHintToBeHighlighted(secondAnswerId)
  })

  it('focuses the answer when clicking a hint', async () => {
    await clickAnswerHint(firstAnswerId)
    await expectAnswerHintToBeFocused(firstAnswerId)

    await clickAnswerHint(secondAnswerId)
    await expectAnswerHintToBeFocused(secondAnswerId)
  })

  async function focusAnswer(questionId: QuestionId) {
    await page.click(`.text-answer[data-question-id="${questionId}"]`)
  }

  async function clickAnswerHint(questionId: QuestionId) {
    await page.click(`.text-answer[data-question-id="${questionId}"]`)
  }

  async function expectAnswerHintToBeHighlighted(questionId: QuestionId) {
    await page.waitForSelector(`.e-hints__hint--focused[data-question-id="${questionId}"]`)
  }

  async function expectAnswerHintToBeFocused(questionId: QuestionId) {
    await page.waitForSelector(`.text-answer[data-question-id="${questionId}"]:focus`)
  }
})
