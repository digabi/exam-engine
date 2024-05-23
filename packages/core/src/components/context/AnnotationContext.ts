import React from 'react'
import { TextAnnotation } from '../../types/Score'

export interface AnnotationContextType {
  annotations: Record<string, TextAnnotation[]>
  onClickAnnotation: (e: React.MouseEvent<HTMLElement, MouseEvent>, a: TextAnnotation) => void
  onSaveAnnotation: (a: TextAnnotation, key: string) => void
}

export const AnnotationContext = React.createContext({} as AnnotationContextType)
