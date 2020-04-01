import React from 'react'

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
      {answers.length > 1 && displayNumber && <sup className="e-result-scorecount-sup e-mrg-r-1">{displayNumber}</sup>}
      {children}
    </div>
  )
}

export default React.memo(ResultsExamQuestionScoresContainer)
