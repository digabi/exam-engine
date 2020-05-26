import React from 'react'
import classnames from 'classnames'

function ResultsExamQuestionScoresContainer({
  answers,
  displayNumber,
  children,
  multilineAnswer,
}: {
  answers: Element[]
  displayNumber?: string
  children: React.ReactNode
  multilineAnswer?: boolean
}) {
  return (
    <div
      className={classnames('e-result-scorecount', 'e-float-right', {
        'e-result-scorecount-multiline-answer': multilineAnswer,
      })}
    >
      <div className="e-result-scorecount-border-wrap">
        {answers.length > 1 && displayNumber && (
          <sup className="e-result-scorecount-sup e-mrg-r-1">{displayNumber}</sup>
        )}
        {children}
      </div>
    </div>
  )
}

export default React.memo(ResultsExamQuestionScoresContainer)
