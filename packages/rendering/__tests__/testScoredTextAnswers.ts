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
    ;[url, close] = await previewExam(resolveExam('EA/EA.xml'))
    page = await createPage()
  })

  afterAll(async () => {
    await close()
  })

  it('highlights the hint when focusing a scored text answer', async () => {
    await page.goto(url, { waitUntil: 'networkidle0' })

    await focusScoredTextAnswer(2)
    await assertScoredTextAnswerHintHighlighted(2)

    await focusScoredTextAnswer(3)
    await assertScoredTextAnswerHintHighlighted(3)
  })

  it('focuses the answer when clicking a hint', async () => {
    await page.goto(url, { waitUntil: 'networkidle0' })

    await clickScoredTextAnswerHint(2)
    await assertScoredTextAnswerHintFocused(2)

    await clickScoredTextAnswerHint(3)
    await assertScoredTextAnswerHintFocused(3)
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
