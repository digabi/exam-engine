import { UniqueIdentifier } from '@dnd-kit/core'
import React, { useContext } from 'react'
import { ExamComponentProps } from '../..'
import { useExamTranslation } from '../../i18n'
import { findMultiChoiceFromGradingStructure, ResultsContext } from '../context/ResultsContext'
import { DNDDroppable } from '../shared/DNDDroppable'

export const CorrectDNDAnswers = ({
  element,
  renderChildNodes,
  renderComponentOverrides,
  answerOptionsById
}: ExamComponentProps & {
  answerOptionsById: Record<UniqueIdentifier, Element>
}) => {
  const questionId = Number(element.getAttribute('question-id')!)
  const { t } = useExamTranslation()

  const { gradingStructure } = useContext(ResultsContext)
  const choice = findMultiChoiceFromGradingStructure(gradingStructure, questionId)!
  const correctOptionIds = choice?.options?.filter(o => o.correct).map(o => o.id)
  const correctDNDAnswerOptions = correctOptionIds?.map(id => answerOptionsById?.[id] || null).filter(Boolean)

  return (
    <>
      <span className="droppable-title align-right">{t('dnd-answers.correct-answers')}</span>
      <DNDDroppable
        renderChildNodes={renderChildNodes}
        renderComponentOverrides={renderComponentOverrides}
        answerOptionElements={correctDNDAnswerOptions}
        correctIds={correctOptionIds}
        questionId={questionId}
        page="results"
        classes={['correct-answers']}
      />
    </>
  )
}
