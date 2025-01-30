export interface NewExamAnnotationBase {
  displayNumber: string
}

interface ExamAnnotationBase extends NewExamAnnotationBase {
  annotationId: number
  markNumber: number
  resolved?: boolean
  hidden?: boolean
}

type ExamTextAnnotationAttributes = {
  annotationType: 'text'
  selectedText: string
  annotationParts: AnnotationPart[]
}
export type NewExamTextAnnotation = NewExamAnnotationBase & ExamTextAnnotationAttributes
export type ExamTextAnnotation = ExamAnnotationBase & ExamTextAnnotationAttributes

type ExamImageAnnotationAttributes = {
  annotationType: 'image'
  annotationAnchor: string
  rect: AnnotationRect
  description: string
}
export type NewExamImageAnnotation = NewExamAnnotationBase & ExamImageAnnotationAttributes
export type ExamImageAnnotation = ExamAnnotationBase & ExamImageAnnotationAttributes

export type NewExamAnnotation = NewExamTextAnnotation | NewExamImageAnnotation
export type ExamAnnotation = ExamTextAnnotation | ExamImageAnnotation

export interface AnnotationPart {
  annotationAnchor: string
  selectedText: string
  startIndex: number
  length: number
  markNumber?: number
  hidden?: boolean
  resolved?: boolean
}

export type WithAnnotationId<T> = T & { annotationId: number }

export type AnnotationRect = { x1: number; y1: number; x2: number; y2: number }
