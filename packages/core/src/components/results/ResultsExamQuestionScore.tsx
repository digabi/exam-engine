import React from 'react'
import { Translation } from 'react-i18next'
import { NBSP } from '../../dom-utils'

interface ResultsExamQuestionScoreProps {
  score?: number
  maxScore?: number
  displayNumber?: string
}

function ResultsExamQuestionScore({ score, maxScore, displayNumber }: ResultsExamQuestionScoreProps) {
  return (
    <div className="e-result-scorecount e-float-right">
      {displayNumber && <sup>{displayNumber}</sup>}
      {NBSP}
      {typeof score === 'number' ? <b>{score}</b> : <div className="e-result-scorecount-empty" />}{' '}
      {maxScore ? `/ ${maxScore} ` : null} <Translation>{t => t('points')}</Translation>
    </div>
  )
}

export default React.memo(ResultsExamQuestionScore)
