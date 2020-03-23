import React from 'react'
import { NBSP } from '../../dom-utils'

function ResultsExamQuestionScoresContainer({
  answers,
  displayNumber,
  children
}: {
  answers: Element[]
  displayNumber?: string
  children: React.ReactNode
}) {
  return (
    <div className="e-result-scorecount e-float-right e-mrg-b-1">
      {answers.length > 1 && displayNumber && <sup>{displayNumber}</sup>}
      {NBSP}
      {children}
    </div>
  )
}

export default React.memo(ResultsExamQuestionScoresContainer)
