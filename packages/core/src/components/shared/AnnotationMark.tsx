import * as _ from 'lodash-es'
import React, { useEffect, useRef } from 'react'
import { NewRenderableAnnotation, RenderableAnnotation } from '../../types/Score'
import { isExistingAnnotation } from './markText'

export const AnnotationMark = ({
  annotation,
  markedText,
  onClickAnnotation,
  setNewAnnotationRef
}: {
  annotation: RenderableAnnotation | NewRenderableAnnotation
  markedText: string
  onClickAnnotation: (e: React.MouseEvent<HTMLElement, MouseEvent>, a: RenderableAnnotation) => void
  setNewAnnotationRef: (ref: HTMLElement | null) => void
}) => {
  const markRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (markRef.current && !isExistingAnnotation(annotation)) {
      setNewAnnotationRef(markRef.current)
    }
  }, [])

  return (
    <mark
      ref={markRef}
      className="e-annotation"
      data-annotation-id={isExistingAnnotation(annotation) ? annotation.annotationId : ''}
      data-hidden="false"
      data-annotation-path={annotation.annotationAnchor}
      onClick={e => (isExistingAnnotation(annotation) ? onClickAnnotation(e, annotation) : undefined)}
    >
      {markedText}
      {annotation?.markNumber && <sup className="e-annotation" data-content={annotation?.markNumber} />}
    </mark>
  )
}
