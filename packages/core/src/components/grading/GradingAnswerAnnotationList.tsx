import * as _ from 'lodash-es'
import React from 'react'
import { Annotation } from '../../index'
import { AnnotationLists } from '../shared/AnnotationLists'

function GradingAnswerAnnotationList({
  pregrading,
  censoring,
  singleGrading
}: {
  pregrading: Annotation[]
  censoring: Annotation[]
  singleGrading: boolean
}) {
  const getListOfAnnotations = (annotations: Annotation[], listNumberOffset = 0) =>
    annotations
      .filter(a => ('length' in a ? !!a.length : true))
      .map((annotation: Annotation, i: number) => {
        const numbering = `${String(listNumberOffset + i + 1)})`
        const message = annotation.message
        return { numbering, message }
      }) ?? []

  const pregradingAnnotations = getListOfAnnotations(pregrading)
  const censoringAnnotations = getListOfAnnotations(censoring, pregradingAnnotations.length)
  return (
    <AnnotationLists
      pregradingAnnotations={pregradingAnnotations}
      censoringAnnotations={censoringAnnotations}
      singleGrading={singleGrading}
    />
  )
}

export default GradingAnswerAnnotationList
