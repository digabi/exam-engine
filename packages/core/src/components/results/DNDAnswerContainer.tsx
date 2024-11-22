import { UniqueIdentifier } from '@dnd-kit/core'
import React, { useContext } from 'react'
import { ChoiceGroupQuestion, ExamComponentProps } from '../..'
import { query, queryAll } from '../../dom-utils'
import { ResultsContext } from '../context/ResultsContext'
import { DNDTitleAndAnswerCommon } from '../shared/DNDTitleAndAnswerCommon'
import { DNDAnswerCommon } from '../shared/DNDAnswerCommon'

export const DNDAnswerContainer = ({ element, renderChildNodes }: ExamComponentProps) => {
  const { answersByQuestionId } = useContext(ResultsContext)
  const dndAnswers = queryAll(element, 'dnd-answer').filter(e => !!query(e, 'dnd-answer-title'))
  const dndAnswerOptions = queryAll(element, 'dnd-answer-option')

  const answerOptionIdsByQuestionId = dndAnswers.reduce(
    (acc, group) => {
      const questionId = group.getAttribute('question-id')!
      const answer = answersByQuestionId[Number(questionId)]?.value
      return {
        ...acc,
        [questionId]: answer ? [Number(answer)] : [],
        root: acc.root.filter(e => e !== Number(answer))
      }
    },
    { root: dndAnswerOptions.map(e => Number(e.getAttribute('option-id')!)) }
  )

  const answerOptionsByOptionId = dndAnswerOptions.reduce(
    (acc, el) => {
      const optionId = el.getAttribute('option-id')!
      return { ...acc, [optionId]: el }
    },
    {} as Record<UniqueIdentifier, Element>
  )

  const dndAnswersWithQuestion = queryAll(element, 'dnd-answer').filter(e => !!query(e, 'dnd-answer-title'))

  const { gradingStructure } = useContext(ResultsContext)

  return (
    <div className="e-dnd-answer-container">
      {dndAnswersWithQuestion.map(element => {
        const displayNumber = element.getAttribute('display-number')!
        const questionId = Number(element.getAttribute('question-id')!)
        const hasAnswer = !!answersByQuestionId[questionId]?.value
        const thisQuestion = gradingStructure.questions.find(
          q => q.displayNumber === displayNumber
        ) as ChoiceGroupQuestion
        const options = thisQuestion.choices.find(c => c.id === questionId)?.options || []
        const correctOptionIds = options.filter(o => o.correct).map(o => o.id)

        return (
          <>
            <DNDTitleAndAnswerCommon
              key={questionId}
              element={element}
              renderChildNodes={renderChildNodes}
              items={answerOptionIdsByQuestionId}
              answerOptionsByQuestionId={answerOptionsByOptionId}
              hasAnswer={hasAnswer}
            />

            <div className="correct-answers">
              <b>Oikeat vastaukset</b>
              <DNDAnswerCommon
                renderChildNodes={renderChildNodes}
                items={correctOptionIds}
                answerOptionsByQuestionId={answerOptionsByOptionId}
                questionId={questionId}
                displayNumber={displayNumber}
                correctIds={correctOptionIds}
              />
            </div>
          </>
        )
      })}
    </div>
  )
}
