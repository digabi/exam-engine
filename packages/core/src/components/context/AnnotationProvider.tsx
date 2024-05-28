import React from 'react'
import { ExamAnnotation } from '../../types/Score'
import { AnnotationProps } from '../exam/Exam'

interface Props {
  children: React.ReactNode
}

export interface AnnotationContextType {
  annotations?: Record<string, ExamAnnotation[]>
  onClickAnnotation?: (e: React.MouseEvent<HTMLElement, MouseEvent>, a: ExamAnnotation) => void
  onSaveAnnotation?: (a: ExamAnnotation) => void
  newAnnotation: ExamAnnotation | null
  setNewAnnotation: (a: ExamAnnotation | null) => void
  newAnnotationRef: HTMLElement | undefined
  setNewAnnotationRef: (ref: HTMLElement | undefined) => void
}

export const AnnotationContext = React.createContext({} as AnnotationContextType)

export const AnnotationProvider = ({
  children,
  annotations,
  onClickAnnotation,
  onSaveAnnotation
}: Props & AnnotationProps) => {
  const [newAnnotation, setNewAnnotation] = React.useState<ExamAnnotation | null>(null)
  const [newAnnotationRef, setNewAnnotationRef] = React.useState<HTMLElement>()

  if (!onClickAnnotation && !onSaveAnnotation) {
    return children
  }

  return (
    <AnnotationContext.Provider
      value={{
        annotations,
        onClickAnnotation,
        onSaveAnnotation,
        setNewAnnotation,
        newAnnotation,
        newAnnotationRef,
        setNewAnnotationRef
      }}
    >
      {children}
    </AnnotationContext.Provider>
  )
}
