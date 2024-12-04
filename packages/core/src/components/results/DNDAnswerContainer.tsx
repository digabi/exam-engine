import { UniqueIdentifier } from '@dnd-kit/core'
import React, { useContext } from 'react'
import { ExamComponentProps } from '../..'
import { query, queryAll } from '../../dom-utils'
import { ResultsContext } from '../context/ResultsContext'
import { DNDTitleAndDroppable } from '../shared/DNDTitleAndDroppable'
import { CorrectDNDAnswers } from './CorrectDNDAnswers'
import { ItemsState } from '../exam/DNDAnswerContainer'

export const DNDAnswerContainer = ({ element, renderChildNodes }: ExamComponentProps) => {
  const { answersByQuestionId, gradingStructure } = useContext(ResultsContext)
  const dndAnswers = queryAll(element, 'dnd-answer').filter(e => !!query(e, 'dnd-answer-title'))
  const dndAnswerOptions = queryAll(element, 'dnd-answer-option')

  const answerOptionIdsByQuestionId: ItemsState = dndAnswers.reduce(
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

  const answerOptionsById: Record<UniqueIdentifier, Element> = dndAnswerOptions.reduce((acc, el) => {
    const optionId = el.getAttribute('option-id')!
    return { ...acc, [optionId]: el }
  }, {})

  const dndAnswersWithQuestion = queryAll(element, 'dnd-answer').filter(e => !!query(e, 'dnd-answer-title'))

  return (
    <div className="e-dnd-answer-container">
      {dndAnswersWithQuestion.map(element => {
        const questionId = element.getAttribute('question-id')!

        const answerOptionElements = (answerOptionIdsByQuestionId[questionId] || [])
          ?.map(id => answerOptionsById?.[id] || null)
          .filter(Boolean)
        const itemIds = answerOptionIdsByQuestionId[questionId] || []

        return (
          <React.Fragment key={questionId}>
            <DNDTitleAndDroppable
              key={questionId}
              element={element}
              answerOptionElements={answerOptionElements}
              renderChildNodes={renderChildNodes}
              itemIds={itemIds}
              page="results"
            />

            {gradingStructure && (
              <CorrectDNDAnswers
                key={`${questionId}-correct`}
                element={element}
                renderChildNodes={renderChildNodes}
                answerOptionsById={answerOptionsById}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
