import { UniqueIdentifier } from '@dnd-kit/core'
import React, { useContext } from 'react'
import { ChoiceGroupQuestion, ExamComponentProps } from '../..'
import { ResultsContext } from '../context/ResultsContext'
import { DNDDroppable } from '../shared/DNDDroppable'
import { useExamTranslation } from '../../i18n'

export const CorrectDNDAnswers = ({
  element,
  renderChildNodes,
  answerOptionsById
}: ExamComponentProps & {
  answerOptionsById: Record<UniqueIdentifier, Element>
}) => {
  const { gradingStructure } = useContext(ResultsContext)

  const displayNumber = element.getAttribute('display-number')!
  const questionId = Number(element.getAttribute('question-id')!)
  const thisQuestion = gradingStructure?.questions.find(q => q.displayNumber === displayNumber) as ChoiceGroupQuestion
  const options = thisQuestion?.choices.find(c => c.id === questionId)?.options || []
  const correctOptionIds = options?.filter(o => o.correct).map(o => o.id)
  const correctDNDAnswerOptions = correctOptionIds?.map(id => answerOptionsById?.[id] || null).filter(Boolean)
  const { t } = useExamTranslation()

  return (
    <>
      <span className="droppable-title align-right">{t('dnd-answers.correct-answers')}</span>
      <DNDDroppable
        renderChildNodes={renderChildNodes}
        answerOptionElements={correctDNDAnswerOptions}
        correctIds={correctOptionIds}
        questionId={questionId}
        page="results"
        classes={['correct-answers']}
      />
    </>
  )
}