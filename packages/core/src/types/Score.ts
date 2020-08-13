import { QuestionId } from './ExamAnswer'

export type AnswerId = number

export interface Score {
  questionId: QuestionId
  answerId: AnswerId
  pregrading?: PregradingScore
  censoring?: CensoringScore
  inspection?: InspectionScore
  autograding?: AutogradedScore
}

export interface AutogradedScore {
  score: number
}

export interface PregradingScore {
  score?: number
  comment?: string
  annotations?: Annotation[]
}

export interface CensoringScore {
  scores: Array<{ score: number; shortCode: string }>
  annotations?: Annotation[]
  nonAnswerDetails?: { shortCode?: string }
  comment?: string
}

export interface InspectionScore {
  score: number
  shortCodes: [string, string] | [string, string, string]
}

export interface LineAnnotation {
  type: 'line'
  attachmentIndex: number
  message: string
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface RectAnnotation {
  type: 'rect'
  attachmentIndex: number
  message: string
  x: number
  y: number
  width: number
  height: number
}

export type ImageAnnotation = LineAnnotation | RectAnnotation

export interface TextAnnotation {
  /** Legacy exams don't have this property, so it's marked as optional. */
  type?: 'text'
  startIndex: number
  length: number
  message: string
}

export type Annotation = TextAnnotation | ImageAnnotation
