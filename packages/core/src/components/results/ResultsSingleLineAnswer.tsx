import React from 'react'
import { AnswerWithScores } from '../types'
import { getAnnotationAttributes } from './helpers'

function ResultsSingleLineAnswer({
  answers,
  displayNumber,
  answerScores,
  value,
  children
}: {
  answers: Element[]
  answerScores?: AnswerWithScores
  displayNumber: string
  value: string | undefined
  children: React.ReactNode
}) {
  return (
    <>
      {answers.length > 1 && <sup>{displayNumber}</sup>}
      <span className="answer">
        <span className="text-answer text-answer--single-line answer-text-container">
          <div className="answerText e-inline" {...getAnnotationAttributes(answerScores)}>
            {value}
          </div>
        </span>
      </span>
      {children}
    </>
  )
}

export default React.memo(ResultsSingleLineAnswer)
