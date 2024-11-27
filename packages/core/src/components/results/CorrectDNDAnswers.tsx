import { UniqueIdentifier } from '@dnd-kit/core'
import React, { useContext } from 'react'
import { ChoiceGroupQuestion, ExamComponentProps } from '../..'
import { ResultsContext } from '../context/ResultsContext'
import { DNDAnswerDroppable } from '../shared/DNDAnswerDroppable'

export const CorrectDNDAnswers = ({
  element,
  renderChildNodes,
  dndAnswerOptions
}: ExamComponentProps & {
  dndAnswerOptions: Element[]
}) => {
  const { gradingStructure } = useContext(ResultsContext)

  const answerOptionsByOptionId = dndAnswerOptions.reduce(
    (acc, el) => {
      const optionId = el.getAttribute('option-id')!
      return { ...acc, [optionId]: el }
    },
    {} as Record<UniqueIdentifier, Element>
  )

  const displayNumber = element.getAttribute('display-number')!
  const questionId = Number(element.getAttribute('question-id')!)
  const thisQuestion = gradingStructure?.questions.find(q => q.displayNumber === displayNumber) as ChoiceGroupQuestion
  const options = thisQuestion?.choices.find(c => c.id === questionId)?.options || []
  const correctOptionIds = options?.filter(o => o.correct).map(o => o.id)

  return (
    <>
      <span className="droppable-title align-right">Oikeat vastaukset</span>
      <DNDAnswerDroppable
        renderChildNodes={renderChildNodes}
        items={correctOptionIds}
        answerOptionsByQuestionId={answerOptionsByOptionId}
        correctIds={correctOptionIds}
        questionId={questionId}
        page="results"
        classes={{ 'correct-answers': true }}
      />
    </>
  )
}
