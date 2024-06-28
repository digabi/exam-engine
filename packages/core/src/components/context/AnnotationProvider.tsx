import React from 'react'
import { NewExamAnnotation } from '../../types/Score'
import { AnnotationProps } from '../exam/Exam'
import { onMouseDownForAnnotation } from '../grading/examAnnotationUtils'
import { AnnotationPopup } from '../shared/AnnotationPopup'

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

  const mouseUpCallback = (annotation: NewExamAnnotation) => {
    console.log('UP')
    setNewAnnotation(annotation)
  }

  function onMouseDown(e: React.MouseEvent) {
    console.log('DOWN')
    const target = e.target as Element
    const clickIsInPopup = target.closest('.annotation-popup')
    if (!clickIsInPopup) {
      setNewAnnotation(null)
    }
    onMouseDownForAnnotation(e, mouseUpCallback)
  }

  if (!onClickAnnotation && !onSaveAnnotation) {
    return children
  }

  return (
    <AnnotationContext.Provider
      value={{
        annotations,
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
