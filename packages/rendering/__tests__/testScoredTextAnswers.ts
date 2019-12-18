import { QuestionId } from '@digabi/exam-engine-core'
import { resolveExam } from '@digabi/exam-engine-exams'
import { CloseFunction, previewExam } from '@digabi/exam-engine-rendering'
import { Page } from 'puppeteer'
import { initPuppeteer } from './puppeteerUtils'

describe('testScoredTextAnswers.ts — Scored text answer interactions', () => {
  const createPage = initPuppeteer()
  let page: Page
  let url: string
  let close: CloseFunction

  beforeAll(async () => {
    ;[url, close] = await previewExam(resolveExam('SC/SC.xml'))
    page = await createPage()
  })

  afterAll(async () => {
    await close()
  })

  it('highlights the hint when focusing a scored text answer', async () => {
    await page.goto(url, { waitUntil: 'networkidle0' })

    await focusScoredTextAnswer(81)
    await assertScoredTextAnswerHintHighlighted(81)

    await focusScoredTextAnswer(82)
    await assertScoredTextAnswerHintHighlighted(82)
  })

  it('focuses the answer when clicking a hint', async () => {
    await page.goto(url, { waitUntil: 'networkidle0' })

    await clickScoredTextAnswerHint(81)
    await assertScoredTextAnswerHintFocused(81)

    await clickScoredTextAnswerHint(82)
    await assertScoredTextAnswerHintFocused(82)
  })

  async function focusScoredTextAnswer(questionId: QuestionId) {
    await page.click(`.text-answer[data-question-id="${questionId}"]`)
  }

  async function clickScoredTextAnswerHint(questionId: QuestionId) {
    await page.click(`.text-answer[data-question-id="${questionId}"]`)
  }

  async function assertScoredTextAnswerHintHighlighted(questionId: QuestionId) {
    await page.waitForSelector(`.e-scored-text-answer-hint--focused[data-question-id="${questionId}"]`)
  }

  async function assertScoredTextAnswerHintFocused(questionId: QuestionId) {
    await page.waitForSelector(`.text-answer[data-question-id="${questionId}"]:focus`)
  }
})
