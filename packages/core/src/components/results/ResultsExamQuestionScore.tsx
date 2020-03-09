import React, { useContext } from 'react'
import { Translation } from 'react-i18next'
import { NBSP } from '../../dom-utils'
import { QuestionContext } from '../QuestionContext'

interface ResultsExamQuestionScoreProps {
  score?: number
  maxScore?: number
  displayNumber?: string
}

function ResultsExamQuestionScore({ score, maxScore, displayNumber }: ResultsExamQuestionScoreProps) {
  const { answers } = useContext(QuestionContext)
  return (
    <div className="e-result-scorecount e-float-right">
      {answers.length > 1 && displayNumber && <sup>{displayNumber}</sup>}
      {NBSP}
      {typeof score === 'number' ? <b>{score}</b> : <div className="e-result-scorecount-empty" />}{' '}
      {maxScore ? `/ ${maxScore} ` : null} <Translation>{t => t('points')}</Translation>
    </div>
  )
}

export default React.memo(ResultsExamQuestionScore)
