import React, { useContext } from 'react'
import { Translation } from 'react-i18next'
import { QuestionContext } from '../QuestionContext'
import ResultsExamQuestionScoresContainer from './ResultsExamQuestionScoresContainer'

export interface ResultsExamQuestionAutoScoreProps {
  score?: number
  maxScore?: number
  displayNumber?: string
}

function ResultsExamQuestionAutoScore({ score, maxScore, displayNumber }: ResultsExamQuestionAutoScoreProps) {
  const { answers } = useContext(QuestionContext)
  return (
    <ResultsExamQuestionScoresContainer answers={answers} displayNumber={displayNumber}>
      {typeof score === 'number' ? <b>{score}</b> : <div className="e-result-scorecount-empty" />}{' '}
      {maxScore ? `/ ${maxScore} ` : null} <Translation>{t => t('points')}</Translation>
    </ResultsExamQuestionScoresContainer>
  )
}

export default React.memo(ResultsExamQuestionAutoScore)
