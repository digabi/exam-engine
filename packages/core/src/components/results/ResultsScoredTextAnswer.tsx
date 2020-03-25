import React, { useContext } from 'react'
import { getNumericAttribute } from '../../dom-utils'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import { QuestionContext } from '../QuestionContext'
import { ExamComponentProps, TextAnswer } from '../types'
import { findScore, ResultsContext } from './ResultsContext'
import ResultsExamQuestionAutoScore from './ResultsExamQuestionAutoScore'
import ResultsSingleLineAnswer from './ResultsSingleLineAnswer'

function ResultsScoredTextAnswer({ element }: ExamComponentProps) {
  const { answers } = useContext(QuestionContext)
  const { answersByQuestionId, scores } = useContext(ResultsContext)
  const questionId = getNumericAttribute(element, 'question-id')!
  const maxScore = getNumericAttribute(element, 'max-score')!
  const answer = answersByQuestionId[questionId] as TextAnswer | undefined
  const value = answer && answer.value
  const displayNumber = shortDisplayNumber(element.getAttribute('display-number')!)
  const autogradingScore = findScore(scores, questionId)?.autograding

  return (
    <ResultsSingleLineAnswer answers={answers} displayNumber={displayNumber} value={value}>
      <ResultsExamQuestionAutoScore
        score={autogradingScore?.score}
        maxScore={maxScore}
        displayNumber={answers.length > 1 ? displayNumber : undefined}
      />
    </ResultsSingleLineAnswer>
  )
}

export default React.memo(ResultsScoredTextAnswer)
