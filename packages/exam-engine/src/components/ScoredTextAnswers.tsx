import classNames from 'classnames'
import React from 'react'
import { useSelector } from 'react-redux'
import { RenderChildNodes } from '../createRenderChildNodes'
import { findChildElement, getNumericAttribute, NBSP, queryAll } from '../dom-utils'
import { AppState } from '../store'
import { Score } from './Score'
import { ExamComponentProps, QuestionId } from './types'

function ScoredTextAnswers({ element, renderChildNodes }: ExamComponentProps) {
  const focusedQuestionId = useSelector((state: AppState) => state.answers.focusedQuestionId)
  const scoredTextAnswersWithHints = queryAll(element, 'scored-text-answer').filter(
    scoredTextAnswer => findChildElement(scoredTextAnswer, 'hint') != null
  )

  return (
    <div className="e-columns">
      <div className="e-column--8">{renderChildNodes(element)}</div>
      {/* Intentionally not semantically correct, so we don't have to do any
      special handling to make screen readers ignore it, especially wrt.
      keyboard navigation. */}
      <div className="e-scored-text-answers e-column e-column--4 e-pad-l-4" aria-hidden="true">
        {scoredTextAnswersWithHints.map((scoredTextAnswer, i) => (
          <ScoredTextAnswerHint {...{ scoredTextAnswer, focusedQuestionId, renderChildNodes, key: i }} />
        ))}
      </div>
    </div>
  )
}

function ScoredTextAnswerHint({
  scoredTextAnswer,
  focusedQuestionId,
  renderChildNodes
}: {
  scoredTextAnswer: Element
  focusedQuestionId: QuestionId | null
  renderChildNodes: RenderChildNodes
}) {
  const questionId = getNumericAttribute(scoredTextAnswer, 'question-id')
  const displayNumber = scoredTextAnswer.getAttribute('display-number')!
  const maxScore = getNumericAttribute(scoredTextAnswer, 'max-score')!
  const hint = findChildElement(scoredTextAnswer, 'hint')!

  return (
    <p
      className={classNames('e-scored-text-answer-hint', {
        'e-scored-text-answer-hint--focused': focusedQuestionId === questionId
      })}
      onClick={() => {
        const question = document.querySelector<HTMLElement>(`.text-answer[data-question-id="${questionId}"]`)
        if (question) {
          question.focus()
        }
      }}
      data-question-id={questionId}
    >
      <sup>{displayNumber}</sup>
      {NBSP}
      <span className="e-mrg-r-1">{renderChildNodes(hint)}</span>
      <Score score={maxScore} />
    </p>
  )
}

export default React.memo(ScoredTextAnswers)
