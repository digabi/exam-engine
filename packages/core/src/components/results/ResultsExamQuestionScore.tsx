import React from 'react'
import { Translation } from 'react-i18next'
import { NBSP } from '../../dom-utils'

interface ResultsExamQuestionScoreProps {
  score: number
  maxScore?: number
  displayNumber?: string
  className?: string
}

const ResultsExamQuestionScore = ({ score, maxScore, displayNumber, className }: ResultsExamQuestionScoreProps) => (
  <div className={`e-result-scorecount ${className}`}>
    {displayNumber && <sup>{displayNumber}</sup>}
    {NBSP}
    <b>{score}</b> {maxScore ? `/ ${maxScore} ` : null} <Translation>{t => t('points')}</Translation>
  </div>
)

export default ResultsExamQuestionScore
