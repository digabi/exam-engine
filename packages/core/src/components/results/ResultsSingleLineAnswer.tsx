import React from 'react'
import { Score } from '../types'
import { getAnnotationAttributes } from './helpers'

function ResultsSingleLineAnswer({
  answers,
  displayNumber,
  answerScores,
  value,
  children
}: {
  answers: Element[]
  answerScores?: Score
  displayNumber: string
  value: string | undefined
  children: React.ReactNode
}) {
  return (
    <>
      {answers.length > 1 && <sup>{displayNumber}</sup>}
      <span className="answer text-answer text-answer--single-line">
        <span className="e-inline-block answer-text-container">
          <div className="answerText e-inline-block" {...getAnnotationAttributes(answerScores)}>
            {value}
          </div>
        </span>
      </span>
      {children}
    </>
  )
}

export default React.memo(ResultsSingleLineAnswer)
