import React, { useContext } from 'react'
import { AnnotationContext } from '../context/AnnotationProvider'
import { markText } from '../shared/AnnotatableText'
import { GradingAnswerProps } from './GradingAnswer'

export function AnnotatableGradingAnswer(props: GradingAnswerProps) {
  const path = 'pregrading'
  const textWithoutLineBreaksAndExtraSpaces = props.answer.value
  const annotationContextData = useContext(AnnotationContext)
  const { newAnnotation, annotations, onClickAnnotation, setNewAnnotationRef } = annotationContextData

  const canNotBeAnnotated =
    annotationContextData?.annotations === undefined || textWithoutLineBreaksAndExtraSpaces.length === 0
  if (canNotBeAnnotated) {
    return textWithoutLineBreaksAndExtraSpaces
  }
  const newAnnotationForThisNode = newAnnotation?.annotationAnchor === path ? newAnnotation : null

  const thisNodeAnnotations = [
    ...(annotations?.[path] || []),
    ...(newAnnotationForThisNode ? [newAnnotationForThisNode] : [])
  ]

  return (
    <span className="e-annotatable" key="abc" data-annotation-path={path} data-testid="123">
      {thisNodeAnnotations?.length > 0 && onClickAnnotation
        ? markText(textWithoutLineBreaksAndExtraSpaces, thisNodeAnnotations, onClickAnnotation, setNewAnnotationRef)
        : textWithoutLineBreaksAndExtraSpaces}
    </span>
  )
}
