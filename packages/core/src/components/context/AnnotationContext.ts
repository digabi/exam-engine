import React from 'react'
import { TextAnnotation } from '../../types/Score'

export interface AnnotationContext {
  annotations: Record<string, TextAnnotation>
  onClickAnnotation: (a: TextAnnotation) => void
}

export const AnnotationContext = React.createContext({} as AnnotationContext)
