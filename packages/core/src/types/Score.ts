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

interface BaseAnnotation {
  /** The message attached to the annotation */
  message: string
  showPopup?: boolean
  markNumber?: string
}

export interface TextAnnotation extends BaseAnnotation {
  /** Legacy exams don't have this property, so it's marked as optional. */
  type?: 'text'
  /** A zero-indexed index of the character where the annotation starts at. Images are counted as 1 character. */
  startIndex: number
  /** The length of the annotation in characters. Images are counted as 1 character. */
  length: number
}

// Shape annotations
interface ShapeAnnotation extends BaseAnnotation {
  /** A 0-indexed number describing which <img /> in the answer the annotation is attached to. */
  attachmentIndex: number
}

export interface LineAnnotation extends ShapeAnnotation {
  type: 'line'
  /** Relative x-coordinate between 0 and 1. */
  x1: number
  /** Relative y-coordinate between 0 and 1. */
  y1: number
  /** Relative x-coordinate between 0 and 1. */
  x2: number
  /** Relative y-coordinate between 0 and 1. */
  y2: number
}

export interface RectAnnotation extends ShapeAnnotation {
  type: 'rect'
  /** Relative x-coordinate between 0 and 1. */
  x: number
  /** Relative y-coordinate between 0 and 1. */
  y: number
  /** Relative width between 0 and 1. Note that `x + width` should be less or equal than 1. */
  width: number
  /** Relative height between 0 and 1. Note that `y + height` should be less or equal than 1.*/
  height: number
}

/**
 * Image annotations are annotations attached to a screenshot or a formula.
 * They are described with relative `x` and `y`-coordinates, with `(0, 0)` being
 * in the top left corner of the image and `(1, 1)` being in the bottom right
 * corner of the image.
 */
export type ImageAnnotation = LineAnnotation | RectAnnotation

export type Annotation = TextAnnotation | ImageAnnotation
