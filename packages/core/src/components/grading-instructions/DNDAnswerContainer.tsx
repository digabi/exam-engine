import React from 'react'
import { ExamComponentProps } from '../..'
import { query, queryAll } from '../../dom-utils'
import { getAnswerOptionsByOptionId, ItemsState } from '../exam/DNDAnswerContainer'
import { DNDTitleAndDroppable } from '../shared/DNDTitleAndDroppable'

const getCorrectAnswerOptionIdsByQuestionId = (element: Element) => {
  const correctAnswerOptionsByQuestionId = queryAll(element, 'dnd-answer-option').reduce((acc, el) => {
    const questionId = el.getAttribute('for-question-id')!
    const optionId = el.getAttribute('option-id')!
    if (!questionId) {
      return acc
    }
    const current = acc[questionId] || []
    return { ...acc, [questionId]: current.concat(optionId) }
  }, {} as ItemsState)
  return correctAnswerOptionsByQuestionId
}

export const DNDAnswerContainer = ({ element, renderChildNodes }: ExamComponentProps) => {
  const answerOptionsByOptionId = getAnswerOptionsByOptionId(element)
  const dndAnswersWithQuestion = queryAll(element, 'dnd-answer').filter(e => !!query(e, 'dnd-answer-title'))
  const answerOptionIdsByQuestionId = getCorrectAnswerOptionIdsByQuestionId(element)

  return (
    <div className="e-dnd-answer-container">
      {dndAnswersWithQuestion.map(element => {
        const questionId = element.getAttribute('question-id')!
        const itemIds = answerOptionIdsByQuestionId[questionId] || []
        const answerOptionElements = (answerOptionIdsByQuestionId[questionId] || [])
          ?.map(id => answerOptionsByOptionId?.[id] || null)
          .filter(Boolean)

        return (
          <DNDTitleAndDroppable
            key={questionId}
            element={element}
            answerOptionElements={answerOptionElements}
            renderChildNodes={renderChildNodes}
            itemIds={itemIds}
            page="results"
          />
        )
      })}
    </div>
  )
}
