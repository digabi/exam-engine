import React from 'react'
import { ExamAnnotation } from '../../types/Score'

//type Annotation = ExamAnnotation | TextAnnotation
export interface AnnotationContextType {
  annotations: Record<string, ExamAnnotation[]>
  onClickAnnotation: (e: React.MouseEvent<HTMLElement, MouseEvent>, a: ExamAnnotation) => void
  onSaveAnnotation: (a: ExamAnnotation, key: string) => void
}

export const AnnotationContext = React.createContext({} as AnnotationContextType)
