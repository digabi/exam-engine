import * as _ from 'lodash-es'
import React, { PropsWithChildren, useEffect, useRef } from 'react'
import { AnnotationPart } from '../../types/ExamAnnotations'
import { isExistingAnnotation } from './markText'

function AnnotationMark({
  annotation,
  onClickAnnotation,
  setNewAnnotationRef,
  __html,
  children
}: PropsWithChildren<{
  annotation: AnnotationPart
  onClickAnnotation: (e: React.MouseEvent<HTMLElement, MouseEvent>, annotationId: number) => void
  setNewAnnotationRef: (ref: HTMLElement | null) => void
  __html?: string
}>) {
  const markRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (markRef.current && !isExistingAnnotation(annotation)) {
      setNewAnnotationRef(markRef.current)
    }
  }, [])

  const dangerouslySetInnerHTML = __html ? { dangerouslySetInnerHTML: { __html } } : {}

  return (
    <>
      <mark
        ref={markRef}
        className={`e-annotation ${annotation.resolved ? 'resolved' : ''}`}
        data-annotation-id={isExistingAnnotation(annotation) ? annotation.annotationId : ''}
        data-hidden="false"
        data-annotation-path={annotation.annotationAnchor}
        onClick={e => {
          if (isExistingAnnotation(annotation)) {
            e.stopPropagation()
            onClickAnnotation(e, annotation.annotationId)
          }
        }}
        {...dangerouslySetInnerHTML}
      >
        {__html ? null : children}
      </mark>
      {annotation?.markNumber && <sup className="e-annotation" data-content={annotation?.markNumber} />}
    </>
  )
}

export default React.memo(AnnotationMark)
