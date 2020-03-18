import React from 'react'
import { Annotation } from '../types'

function ResultsSingleLineAnswer({
  answers,
  displayNumber,
  annotations,
  value,
  children
}: {
  answers: Element[]
  displayNumber: string
  annotations: Annotation[]
  value: string | undefined
  children: React.ReactNode
}) {
  return (
    <>
      {answers.length > 1 && <sup>{displayNumber}</sup>}
      <span className="answer">
        <span className="text-answer text-answer--single-line answer-text-container">
          <div className="answerText e-inline" data-annotations={JSON.stringify(annotations)}>
            {value}
          </div>
        </span>
      </span>
      {children}
    </>
  )
}

export default React.memo(ResultsSingleLineAnswer)
