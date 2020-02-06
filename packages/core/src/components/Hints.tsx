import classNames from 'classnames'
import React from 'react'
import { ReactReduxContext, useSelector } from 'react-redux'
import { RenderChildNodes } from '../createRenderChildNodes'
import { findChildElement, getNumericAttribute, NBSP, queryAll } from '../dom-utils'
import { shortDisplayNumber } from '../shortDisplayNumber'
import { AppState } from '../store'
import { ExamComponentProps, QuestionId } from './types'

function Hints({ element, renderChildNodes }: ExamComponentProps) {
  // Allow using this component both in stateful (Exam) and stateless (Results)
  // contexts without having to duplicate code. `_currentValue` is an an
  // internal implementation detail of React, so this might be a bit brittle,
  // but the rendering tests should notice if React's implementation has
  // changed.
  const focusedQuestionId = (ReactReduxContext.Consumer as any)._currentValue
    ? useSelector((state: AppState) => state.answers.focusedQuestionId)
    : null
  const answersWithHints = queryAll(element, ['text-answer', 'scored-text-answer']).filter(
    answer => findChildElement(answer, 'hint') != null
  )

  return (
    <div className="e-columns">
      <div className="e-column e-column--8">{renderChildNodes(element)}</div>
      {/* Intentionally not semantically correct, so we don't have to do any
      special handling to make screen readers ignore it, especially wrt.
      keyboard navigation. */}
      <div className="e-hints e-column e-column--4" aria-hidden="true">
        {answersWithHints.map((answer, i) => (
          <Hint {...{ answer, focusedQuestionId, renderChildNodes, key: i }} />
        ))}
      </div>
    </div>
  )
}

function Hint({
  answer,
  focusedQuestionId,
  renderChildNodes
}: {
  answer: Element
  focusedQuestionId: QuestionId | null
  renderChildNodes: RenderChildNodes
}) {
  const questionId = getNumericAttribute(answer, 'question-id')
  const displayNumber = answer.getAttribute('display-number')!
  const hint = findChildElement(answer, 'hint')!

  return (
    <p
      className={classNames('e-hints__hint', {
        'e-hints__hint--focused': focusedQuestionId === questionId
      })}
      onClick={() => {
        const question = document.querySelector<HTMLElement>(`.text-answer[data-question-id="${questionId}"]`)
        if (question) {
          question.focus()
        }
      }}
      data-question-id={questionId}
    >
      {shortDisplayNumber(displayNumber)}
      {NBSP}
      {renderChildNodes(hint)}
    </p>
  )
}

export default React.memo(Hints)
