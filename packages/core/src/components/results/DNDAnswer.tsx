import { UniqueIdentifier } from '@dnd-kit/core'
import React, { useContext } from 'react'
import { ChoiceGroupQuestion, ExamComponentProps } from '../..'
import { findMultiChoiceFromGradingStructure, ResultsContext } from '../context/ResultsContext'
import { DNDAnswerCommon } from '../shared/DNDAnswerCommon'
import ResultsExamQuestionAutoScore from './internal/QuestionAutoScore'

export const DNDAnswer = ({
  renderChildNodes,
  items,
  answerOptionsByQuestionId,
  questionId,
  displayNumber,
  maxScore
}: {
  renderChildNodes: ExamComponentProps['renderChildNodes']
  items: UniqueIdentifier[]
  answerOptionsByQuestionId: Record<UniqueIdentifier, Element>
  questionId: UniqueIdentifier
  displayNumber: string
  maxScore?: number
}) => {
  const questionIdNumber = Number(questionId)

  const { answersByQuestionId, gradingStructure } = useContext(ResultsContext)
  const answer = answersByQuestionId[questionIdNumber]
  const choice = findMultiChoiceFromGradingStructure(gradingStructure, questionIdNumber)!
  const scoreValue = answer?.value
    ? undefined
    : (choice?.options.find(option => option.id === Number(answer.value) && option.correct)?.score ?? 0)

  const thisQuestion = gradingStructure.questions.find(q => q.displayNumber === displayNumber) as ChoiceGroupQuestion
  const options = thisQuestion.choices.find(c => c.id === questionIdNumber)?.options || []
  const correctOptionIds = options.filter(o => o.correct).map(o => o.id)

  return (
    <>
      <DNDAnswerCommon
        renderChildNodes={renderChildNodes}
        items={items}
        answerOptionsByQuestionId={answerOptionsByQuestionId}
        correctIds={correctOptionIds}
        questionId={questionId}
      />

      <ResultsExamQuestionAutoScore
        score={scoreValue}
        maxScore={maxScore}
        displayNumber={displayNumber}
        questionId={questionIdNumber}
      />
    </>
  )
}
