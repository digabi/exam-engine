import React, { useContext } from 'react'
import { ExamComponentProps } from '../..'
import { query, queryAll } from '../../dom-utils'
import { ResultsContext } from '../context/ResultsContext'
import { getAnswerOptionIdsByQuestionId, getAnswerOptionsByOptionId } from '../exam/DNDAnswerContainer'
import { DNDTitleAndDroppable } from '../shared/DNDTitleAndDroppable'
import { CorrectDNDAnswers } from './CorrectDNDAnswers'

export const DNDAnswerContainer = ({ element, renderChildNodes }: ExamComponentProps) => {
  const { answersByQuestionId, gradingStructure } = useContext(ResultsContext)
  const answerOptionIdsByQuestionId = getAnswerOptionIdsByQuestionId(element, answersByQuestionId)
  const answerOptionsByOptionId = getAnswerOptionsByOptionId(element)
  const dndAnswersWithQuestion = queryAll(element, 'dnd-answer').filter(e => !!query(e, 'dnd-answer-title'))

  return (
    <div className="e-dnd-answer-container">
      {dndAnswersWithQuestion.map(element => {
        const questionId = element.getAttribute('question-id')!
        const itemIds = answerOptionIdsByQuestionId[questionId] || []
        const answerOptionElements = (answerOptionIdsByQuestionId[questionId] || [])
          ?.map(id => answerOptionsByOptionId?.[id] || null)
          .filter(Boolean)

        return (
          <React.Fragment key={questionId}>
            <DNDTitleAndDroppable
              element={element}
              answerOptionElements={answerOptionElements}
              renderChildNodes={renderChildNodes}
              itemIds={itemIds}
              page="results"
            />

            {gradingStructure && (
              <CorrectDNDAnswers
                element={element}
                renderChildNodes={renderChildNodes}
                answerOptionsById={answerOptionsByOptionId}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
