import React, { useContext } from 'react'
import { ExamComponentProps } from '../..'
import {
  getAnswerOptionIdsByQuestionId,
  getAnswerOptionsByOptionId,
  getCorrectAnswerOptionIdsByQuestionId,
  query,
  queryAll
} from '../../dom-utils'
import { ResultsContext } from '../context/ResultsContext'
import { CorrectDNDAnswers } from '../results/CorrectDNDAnswers'
import { DNDTitleAndDroppable } from './DNDTitleAndDroppable'

export const DNDAnswerContainer = ({
  element,
  renderChildNodes,
  page
}: ExamComponentProps & {
  page: 'results' | 'grading-instructions'
}) => {
  const { answersByQuestionId, gradingStructure } = useContext(ResultsContext)
  const dndAnswersWithQuestion = queryAll(element, 'dnd-answer').filter(e => !!query(e, 'dnd-answer-title'))
  const answerOptionsByOptionId = getAnswerOptionsByOptionId(element)
  const answerOptionIdsByQuestionId =
    page === 'results'
      ? getAnswerOptionIdsByQuestionId(element, answersByQuestionId)
      : getCorrectAnswerOptionIdsByQuestionId(element)

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
              page={page}
            />

            {page === 'results' && gradingStructure && (
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
