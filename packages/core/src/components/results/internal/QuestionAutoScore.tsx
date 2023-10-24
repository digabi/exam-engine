import React, { useContext } from 'react'
import { useExamTranslation } from '../../../i18n'
import { QuestionContext } from '../../context/QuestionContext'
import ResultsExamQuestionScoresContainer from './QuestionScoresContainer'
import { useIsStudentsFinishExamPage } from '../isExamFinishPageHook'

export interface QuestionAutoScoreProps {
  score?: number
  maxScore?: number
  displayNumber?: string
}

function QuestionAutoScore({ score, maxScore, displayNumber }: QuestionAutoScoreProps) {
  const { answers } = useContext(QuestionContext)
  const { t } = useExamTranslation()
  const containerProps = { answers, displayNumber }

  const isStudentsFinishExamPage = useIsStudentsFinishExamPage()

  if (isStudentsFinishExamPage) {
    return null
  }

  return (
    <ResultsExamQuestionScoresContainer {...containerProps}>
      {typeof score === 'number' ? <b>{score}</b> : <span className="e-result-scorecount-empty" />}{' '}
      {maxScore ? `/ ${maxScore} ` : null} {t('points', { count: '' as any as number })}
    </ResultsExamQuestionScoresContainer>
  )
}

export default React.memo(QuestionAutoScore)
