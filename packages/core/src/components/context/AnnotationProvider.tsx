import * as _ from 'lodash-es'
import React, { useCallback, useMemo } from 'react'
import { AnnotationPart, ExamImageAnnotation, NewExamAnnotation, WithAnnotationId } from '../../types/ExamAnnotations'
import { AnnotationProps } from '../exam/Exam'
import { onMouseDownForAnnotation } from '../grading/examAnnotationUtils'
import { AnnotationPopup } from '../shared/AnnotationPopup'

export type AnnotationContextType = {
  annotationsEnabled: true
  newAnnotation: NewExamAnnotation | null
  setNewAnnotation: (a: NewExamAnnotation | null) => void
  newAnnotationRef: HTMLElement | null
  setNewAnnotationRef: (ref: HTMLElement | null) => void
  textAnnotations: Record<string, WithAnnotationId<AnnotationPart>[]>
  imageAnnotations: Record<string, ExamImageAnnotation[]>
  onClickAnnotation: (e: React.MouseEvent<HTMLElement, MouseEvent>, annotationId: number) => void
  onSaveAnnotation: (annotation: NewExamAnnotation, comment: string) => Promise<string | undefined>
}

export const AnnotationContext = React.createContext<AnnotationContextType | { annotationsEnabled: false }>({
  annotationsEnabled: false
})

export const AnnotationProvider = ({
  children,
  annotations,
  onClickAnnotation,
  onSaveAnnotation
}: React.PropsWithChildren<AnnotationProps>) => {
  const annotationsEnabled = !!annotations && !!onClickAnnotation && !!onSaveAnnotation

  if (!annotationsEnabled) {
    return children
  }

  return (
    <AnnotationContextProvider
      annotations={annotations}
      onClickAnnotation={onClickAnnotation}
      onSaveAnnotation={onSaveAnnotation}
    >
      {children}
    </AnnotationContextProvider>
  )
}

type NonNullableAnnotationProps = {
  annotations: NonNullable<AnnotationProps['annotations']>
  onClickAnnotation: NonNullable<AnnotationProps['onClickAnnotation']>
  onSaveAnnotation: NonNullable<AnnotationProps['onSaveAnnotation']>
}

function AnnotationContextProvider({
  children,
  annotations,
  onClickAnnotation,
  onSaveAnnotation
}: React.PropsWithChildren<NonNullableAnnotationProps>) {
  const [newAnnotation, setNewAnnotation] = React.useState<NewExamAnnotation | null>(null)
  const [newAnnotationRef, setNewAnnotationRef] = React.useState<HTMLElement | null>(null)

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as Element
      const clickIsInPopup = !!target.closest('.e-popup')
      if (!clickIsInPopup) {
        setNewAnnotation(null)
        setNewAnnotationRef(null)
      }
      onMouseDownForAnnotation(e, setNewAnnotation)
    },
    [setNewAnnotation, setNewAnnotationRef, onMouseDownForAnnotation]
  )

  const textAnnotations: AnnotationContextType['textAnnotations'] = useMemo(
    () =>
      _.groupBy(
        annotations.flatMap(a => {
          if (a.annotationType === 'text') {
            return a.annotationParts.map((p, index, arr) => {
              const isLastChild = index === arr.length - 1
              return {
                ...p,
                annotationId: a.annotationId,
                markNumber: isLastChild ? a.markNumber : undefined,
                hidden: a.hidden,
                resolved: a?.resolved
              }
            })
          }
          return []
        }),
        a => a.annotationAnchor
      ),
    [annotations]
  )

  const imageAnnotations: AnnotationContextType['imageAnnotations'] = useMemo(
    () =>
      _.groupBy(
        annotations.flatMap(a => {
          if (a.annotationType === 'image') {
            return a
          }
          return []
        }),
        a => a.annotationAnchor
      ),
    [annotations]
  )

  return (
    <AnnotationContext.Provider
      value={{
        annotationsEnabled: true,
        textAnnotations: textAnnotations,
        imageAnnotations: imageAnnotations,
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
