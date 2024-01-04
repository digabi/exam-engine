import React, { useContext } from 'react'
import { getNumericAttribute } from '../../dom-utils'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import { QuestionContext } from '../context/QuestionContext'
import { findScore, ResultsContext } from '../context/ResultsContext'
import ResultsExamQuestionAutoScore from './internal/QuestionAutoScore'
import ResultsSingleLineAnswer from './SingleLineAnswer'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { TextAnswer } from '../..'

function ScoredTextAnswer({ element }: ExamComponentProps) {
  const { answers } = useContext(QuestionContext)
  const { answersByQuestionId, scores } = useContext(ResultsContext)
  const questionId = getNumericAttribute(element, 'question-id')!
  const maxScore = getNumericAttribute(element, 'max-score')!
  const answer = answersByQuestionId[questionId] as TextAnswer | undefined
  const value = answer && answer.value
  const displayNumber = shortDisplayNumber(element.getAttribute('display-number')!)
  const score = findScore(scores, questionId)
  const autogradingScore = score?.autograding

  return (
    <ResultsSingleLineAnswer answers={answers} displayNumber={displayNumber} value={value} score={score}>
      <ResultsExamQuestionAutoScore
        score={autogradingScore?.score}
        maxScore={maxScore}
        displayNumber={answers.length > 1 ? displayNumber : undefined}
        questionId={questionId}
      />
    </ResultsSingleLineAnswer>
  )
}

export default React.memo(ScoredTextAnswer)
