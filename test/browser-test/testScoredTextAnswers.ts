import { Page } from 'puppeteer'
import { QuestionId } from '../../packages/exam-engine/src/components/types'
import { resolveExam } from '@digabi/mexamples'
import createTestServer, { CloseFunction } from './createTestServer'
import { getCurrentPage } from './domUtils'

describe('testScoredTextAnswers.ts — Scored text answer interactions', function() {
  this.timeout(30000)

  let url: string
  let close: CloseFunction

  before('Start server', async () => {
    ;[url, close] = await createTestServer(resolveExam('EA/EA.xml'))
  })

  after('Close server', async () => {
    await close()
  })

  it('highlights the hint when focusing a scored text answer', async () => {
    const page = getCurrentPage()
    await page.goto(url, { waitUntil: 'networkidle0' })

    await focusScoredTextAnswer(page, 2)
    await assertScoredTextAnswerHintHighlighted(page, 2)

    await focusScoredTextAnswer(page, 3)
    await assertScoredTextAnswerHintHighlighted(page, 3)
  })

  it('focuses the answer when clicking a hint', async () => {
    const page = getCurrentPage()
    await page.goto(url, { waitUntil: 'networkidle0' })

    await clickScoredTextAnswerHint(page, 2)
    await assertScoredTextAnswerHintFocused(page, 2)

    await clickScoredTextAnswerHint(page, 3)
    await assertScoredTextAnswerHintFocused(page, 3)
  })
})

async function focusScoredTextAnswer(page: Page, questionId: QuestionId) {
  await page.click(`.text-answer[data-question-id="${questionId}"]`)
}

async function clickScoredTextAnswerHint(page: Page, questionId: QuestionId) {
  await page.click(`.text-answer[data-question-id="${questionId}"]`)
}

export async function assertScoredTextAnswerHintHighlighted(page: Page, questionId: QuestionId) {
  await page.waitForSelector(`.e-scored-text-answer-hint--focused[data-question-id="${questionId}"]`)
}

export async function assertScoredTextAnswerHintFocused(page: Page, questionId: QuestionId) {
  await page.waitForSelector(`.text-answer[data-question-id="${questionId}"]:focus`)
}
