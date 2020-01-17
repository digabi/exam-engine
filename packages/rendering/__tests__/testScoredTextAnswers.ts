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

  const firstAnswerId = 81
  const secondAnswerId = 82

  it('highlights the hint when focusing a scored text answer', async () => {
    await page.goto(url, { waitUntil: 'networkidle0' })

    await focusAnswer(firstAnswerId)
    await assertAnswerHintHighlighted(firstAnswerId)

    await focusAnswer(secondAnswerId)
    await assertAnswerHintHighlighted(secondAnswerId)
  })

  it('focuses the answer when clicking a hint', async () => {
    await clickAnswerHint(firstAnswerId)
    await assertAnswerHintFocused(firstAnswerId)

    await clickAnswerHint(secondAnswerId)
    await assertAnswerHintFocused(secondAnswerId)
  })

  async function focusAnswer(questionId: QuestionId) {
    await page.click(`.text-answer[data-question-id="${questionId}"]`)
  }

  async function clickAnswerHint(questionId: QuestionId) {
    await page.click(`.text-answer[data-question-id="${questionId}"]`)
  }

  async function assertAnswerHintHighlighted(questionId: QuestionId) {
    await page.waitForSelector(`.e-hints__hint--focused[data-question-id="${questionId}"]`)
  }

  async function assertAnswerHintFocused(questionId: QuestionId) {
    await page.waitForSelector(`.text-answer[data-question-id="${questionId}"]:focus`)
  }
})
