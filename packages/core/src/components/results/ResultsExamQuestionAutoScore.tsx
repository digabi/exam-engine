import React, { useContext } from 'react'
import { useExamTranslation } from '../../i18n'
import { QuestionContext } from '../QuestionContext'
import ResultsExamQuestionScoresContainer from './ResultsExamQuestionScoresContainer'

export interface ResultsExamQuestionAutoScoreProps {
  score?: number
  maxScore?: number
  displayNumber?: string
}

function ResultsExamQuestionAutoScore({ score, maxScore, displayNumber }: ResultsExamQuestionAutoScoreProps) {
  const { answers } = useContext(QuestionContext)
  const { t } = useExamTranslation()
  const containerProps = { answers, displayNumber }
  return (
    <ResultsExamQuestionScoresContainer {...containerProps}>
      {typeof score === 'number' ? <b>{score}</b> : <div className="e-result-scorecount-empty" />}{' '}
      {maxScore ? `/ ${maxScore} ` : null} {t('points')}
    </ResultsExamQuestionScoresContainer>
  )
}

export default React.memo(ResultsExamQuestionAutoScore)
