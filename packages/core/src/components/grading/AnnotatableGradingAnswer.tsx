import React, { useContext } from 'react'
import { AnnotationContext } from '../context/AnnotationProvider'
import { GradingAnswerProps } from './GradingAnswer'

export function AnnotatableGradingAnswer(props: GradingAnswerProps) {
  const path = 'pregrading'
  const answer = props.answer.value

  console.log(props.answer)

  const annotationContextData = useContext(AnnotationContext)
  const { newAnnotation, annotations } = annotationContextData

  const canNotBeAnnotated = annotationContextData?.annotations === undefined || answer.length === 0

  if (canNotBeAnnotated) {
    return answer
  }

  const newAnnotationForThisNode = newAnnotation?.annotationParts.some(p => p.annotationAnchor === path)
    ? newAnnotation
    : null

  const thisNodeAnnotations = [
    ...(annotations?.[path] || []),
    ...(newAnnotationForThisNode ? [newAnnotationForThisNode] : [])
  ]

  console.log(answer)
  console.log(thisNodeAnnotations)

  return (
    <span className="e-annotatable" data-annotation-path={path} data-testid="123">
      {/*
      thisNodeAnnotations?.length > 0 && onClickAnnotation
        ? markText(answer, thisNodeAnnotations, onClickAnnotation, setNewAnnotationRef)
        : answer
        */}
    </span>
  )
}
