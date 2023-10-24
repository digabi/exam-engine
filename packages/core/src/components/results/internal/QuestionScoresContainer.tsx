import React, { useContext } from 'react'
import classnames from 'classnames'
import { QuestionContext } from '../../context/QuestionContext'
import { useIsStudentsFinishExamPage } from '../isExamFinishPageHook'

function QuestionScoresContainer({
  answers,
  displayNumber,
  children,
  multilineAnswer
}: {
  answers: Element[]
  displayNumber?: string
  children: React.ReactNode
  multilineAnswer?: boolean
}) {
  const { displayNumber: topLevelDisplayNumber } = useContext(QuestionContext)
  const isStudentsFinishExamPage = useIsStudentsFinishExamPage()
  const fullDisplayNumber = displayNumber ? `${topLevelDisplayNumber}.${displayNumber?.replace('.', '')}` : undefined
  if (isStudentsFinishExamPage) {
    return null
  }
  return (
    <span
      className={classnames('e-result-scorecount', 'e-float-right', {
        'e-result-scorecount-multiline-answer': multilineAnswer
      })}
      id={fullDisplayNumber}
    >
      <span className="e-result-scorecount-border-wrap">
        {answers.length > 1 && displayNumber && (
          <sup className="e-result-scorecount-sup e-mrg-r-1" aria-hidden="true">
            {displayNumber}
          </sup>
        )}
        {children}
      </span>
    </span>
  )
}

export default React.memo(QuestionScoresContainer)
