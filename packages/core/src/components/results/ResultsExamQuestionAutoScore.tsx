import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { QuestionContext } from '../QuestionContext'
import ResultsExamQuestionScoresContainer from './ResultsExamQuestionScoresContainer'

export interface ResultsExamQuestionAutoScoreProps {
  score?: number
  maxScore?: number
  displayNumber?: string
}

function ResultsExamQuestionAutoScore({ score, maxScore, displayNumber }: ResultsExamQuestionAutoScoreProps) {
  const { answers } = useContext(QuestionContext)
  const { t } = useTranslation()
  const containerProps = { answers, displayNumber }
  return (
    <ResultsExamQuestionScoresContainer {...containerProps}>
      {typeof score === 'number' ? <b>{score}</b> : <div className="e-result-scorecount-empty" />}{' '}
      {maxScore ? `/ ${maxScore} ` : null} {t('points')}
    </ResultsExamQuestionScoresContainer>
  )
}

export default React.memo(ResultsExamQuestionAutoScore)
