import { UniqueIdentifier } from '@dnd-kit/core'
import React, { useContext } from 'react'
import { ExamComponentProps } from '../..'
import { findMultiChoiceFromGradingStructure, ResultsContext } from '../context/ResultsContext'
import { DNDAnswerCommon } from '../shared/DNDAnswerCommon'
import ResultsExamQuestionAutoScore from './internal/QuestionAutoScore'

type ItemsState = {
  root: UniqueIdentifier[]
  [key: UniqueIdentifier]: UniqueIdentifier[]
}

export const DNDAnswer = ({
  renderChildNodes,
  items,
  answerOptionsByQuestionId,
  questionId,
  displayNumber,
  maxScore
}: {
  renderChildNodes: ExamComponentProps['renderChildNodes']
  items: ItemsState
  answerOptionsByQuestionId: Record<UniqueIdentifier, Element>
  questionId: UniqueIdentifier
  displayNumber: string
  maxScore?: number
}) => {
  const questionIdNumber = Number(questionId)

  const { answersByQuestionId, gradingStructure } = useContext(ResultsContext)
  const answer = answersByQuestionId[questionIdNumber]
  const choice = findMultiChoiceFromGradingStructure(gradingStructure, questionIdNumber)!
  const scoreValue = (answer && choice?.options.find(option => option.id === Number(answer.value))?.score) || 0

  return (
    <>
      <DNDAnswerCommon
        renderChildNodes={renderChildNodes}
        items={items}
        answerOptionsByQuestionId={answerOptionsByQuestionId}
        questionId={questionId}
        displayNumber={displayNumber}
      />

      {scoreValue != null && (
        <ResultsExamQuestionAutoScore
          score={scoreValue}
          maxScore={maxScore}
          displayNumber={displayNumber}
          questionId={questionIdNumber}
        />
      )}
    </>
  )
}
