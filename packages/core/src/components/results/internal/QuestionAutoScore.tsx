import React, { useContext } from 'react'
import { useExamTranslation } from '../../../i18n'
import { QuestionContext } from '../../context/QuestionContext'
import ResultsExamQuestionScoresContainer from './QuestionScoresContainer'

export interface QuestionAutoScoreProps {
  score?: number
  maxScore?: number
  displayNumber?: string
  questionId: number
}

function QuestionAutoScore({ score, maxScore, displayNumber, questionId }: QuestionAutoScoreProps) {
  const { answers } = useContext(QuestionContext)
  const { t } = useExamTranslation()
  const containerProps = { answers, displayNumber, questionId }

  return (
    <ResultsExamQuestionScoresContainer {...containerProps}>
      {typeof score === 'number' ? <b>{score}</b> : <span className="e-result-scorecount-empty" />}{' '}
      {maxScore ? `/ ${maxScore} ` : null} {t('points', { count: '' as any as number })}
    </ResultsExamQuestionScoresContainer>
  )
}

export default React.memo(QuestionAutoScore)
