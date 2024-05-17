import React from 'react'
import { NewExamAnnotation } from '../../types/Score'
import { AnnotationProps } from '../exam/Exam'

interface Props {
  children: React.ReactNode
}

export interface AnnotationContextType extends AnnotationProps {
  newAnnotation: NewExamAnnotation | null
  setNewAnnotation: (a: NewExamAnnotation | null) => void
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
  const [newAnnotation, setNewAnnotation] = React.useState<NewExamAnnotation | null>(null)
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
