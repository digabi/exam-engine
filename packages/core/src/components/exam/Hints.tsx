import classNames from 'classnames'
import React from 'react'
import { useSelector } from 'react-redux'
import { ExamComponentProps, RenderChildNodes } from '../../createRenderChildNodes'
import { findChildElement, getNumericAttribute, hasSiblingQuestions, queryAll } from '../../dom-utils'
import { QuestionId } from '../../index'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import { AnswersState } from '../../store/answers/reducer'

const Hints: React.FunctionComponent<ExamComponentProps> = ({ element, renderChildNodes }) => {
  const focusedQuestionId = useSelector((state: { answers: AnswersState }) => state.answers.focusedQuestionId)
  const answersWithHints = queryAll(element, ['text-answer', 'scored-text-answer']).filter(
    answer => findChildElement(answer, 'hint') != null
  )

  return answersWithHints.length > 0 ? (
    <div className="e-columns">
      <div className="e-column e-column--8">{renderChildNodes(element)}</div>
      {/* Intentionally not semantically correct, so we don't have to do any
      special handling to make screen readers ignore it, especially wrt.
      keyboard navigation. */}
      <div className="e-hints e-column e-column--4" aria-hidden="true">
        {answersWithHints.map((answer, i) => (
          <Hint {...{ answer, focusedQuestionId, renderChildNodes }} key={i} />
        ))}
      </div>
    </div>
  ) : (
    <>{renderChildNodes(element)}</>
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
  const questionId = getNumericAttribute(answer, 'question-id')!
  const displayNumber = answer.getAttribute('display-number')!
  const hint = findChildElement(answer, 'hint')!

  const hasSiblings = hasSiblingQuestions(answer)

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
      {hasSiblings && shortDisplayNumber(displayNumber)} {renderChildNodes(hint)}
    </p>
  )
}

export default Hints
