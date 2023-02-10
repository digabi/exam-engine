import React, { useLayoutEffect, useRef } from 'react'
import { Annotation } from '../..'
import { renderAnnotations } from '../../renderAnnotations'
import * as _ from 'lodash-es'

export const AnswerWithAnnotations: React.FunctionComponent<{
  type: 'richText' | 'text'
  value?: string
  annotations: { pregrading: Annotation[]; censoring: Annotation[] }
}> = ({ type, annotations, value }) => {
  const answerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    console.log('LAYOUT', annotations.censoring.length)
    if (answerRef.current) {
      answerRef.current.innerHTML = value || ''
      renderAnnotations(answerRef.current, annotations.pregrading, annotations.censoring)
    }
  })
  return type === 'richText' ? (
    <div ref={answerRef} />
  ) : (
    <span className="text-answer text-answer--single-line">
      <span className="e-inline-block" ref={answerRef}>
        {value}
      </span>
    </span>
  )
}
