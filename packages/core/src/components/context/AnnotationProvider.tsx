import * as _ from 'lodash-es'
import React, { useMemo } from 'react'
import { NewExamAnnotation, RenderableAnnotation } from '../../types/Score'
import { AnnotationProps } from '../exam/Exam'
import { onMouseDownForAnnotation } from '../grading/examAnnotationUtils'
import { AnnotationPopup } from '../shared/AnnotationPopup'

interface Props {
  children: React.ReactNode
}

export interface RenderableAnnotationProps {
  annotations: Record<string, RenderableAnnotation[]>
  onClickAnnotation?: (e: React.MouseEvent<HTMLElement, MouseEvent>, annotation: RenderableAnnotation) => void
  onSaveAnnotation?: (annotation: NewExamAnnotation, comment: string) => Promise<string | undefined>
}

export interface AnnotationContextType extends RenderableAnnotationProps {
  newAnnotation: NewExamAnnotation | null
  setNewAnnotation: (a: NewExamAnnotation | null) => void
  newAnnotationRef: HTMLElement | null
  setNewAnnotationRef: (ref: HTMLElement | null) => void
}

export const AnnotationContext = React.createContext({} as AnnotationContextType)

export const AnnotationProvider = ({
  children,
  annotations,
  onClickAnnotation,
  onSaveAnnotation
}: Props & AnnotationProps) => {
  const [newAnnotation, setNewAnnotation] = React.useState<NewExamAnnotation | null>(null)
  const [newAnnotationRef, setNewAnnotationRef] = React.useState<HTMLElement | null>(null)

  const mouseUpCallback = (annotation: NewExamAnnotation) => {
    setNewAnnotation(annotation)
  }

  function onMouseDown(e: React.MouseEvent) {
    const target = e.target as Element
    const clickIsInPopup = !!target.closest('.e-popup')
    if (!clickIsInPopup) {
      setNewAnnotation(null)
      setNewAnnotationRef(null)
    }
    onMouseDownForAnnotation(e, mouseUpCallback)
  }

  if (!onClickAnnotation && !onSaveAnnotation) {
    return children
  }

  const annotationPartsToRenderableAnnotations: Record<string, RenderableAnnotation[]> = useMemo(
    () =>
      _.groupBy(
        annotations?.flatMap(a =>
          a.annotationParts.map((p, index, arr) => {
            const isLastChild = index === arr.length - 1
            return {
              ...p,
              annotationId: a.annotationId,
              markNumber: isLastChild ? a.markNumber : undefined,
              hidden: a.hidden,
              resolved: a?.resolved
            }
          })
        ) || [],
        'annotationAnchor'
      ),
    [JSON.stringify(annotations)]
  )

  return (
    <AnnotationContext.Provider
      value={{
        annotations: annotationPartsToRenderableAnnotations,
        onClickAnnotation,
        onSaveAnnotation,
        newAnnotation,
        setNewAnnotation,
        newAnnotationRef,
        setNewAnnotationRef
      }}
    >
      <span onMouseDown={onMouseDown}>
        <AnnotationPopup />
        {children}
      </span>
    </AnnotationContext.Provider>
  )
}
