import { UniqueIdentifier } from '@dnd-kit/core'
import React, { useContext } from 'react'
import { ExamComponentProps } from '../..'
import { query, queryAll } from '../../dom-utils'
import { ResultsContext } from '../context/ResultsContext'
import { DNDTitleAndAnswer } from './DNDAnswer'

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

  return (
    <div className="e-dnd-answer-container">
      {dndAnswersWithQuestion.map(element => {
        const id = element.getAttribute('question-id')!

        return (
          <DNDTitleAndAnswer
            key={id}
            element={element}
            renderChildNodes={renderChildNodes}
            items={answerOptionIdsByQuestionId}
            answerOptionsByQuestionId={answerOptionsByOptionId}
          />
        )
      })}
    </div>
  )
}
