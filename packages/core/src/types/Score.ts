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

export interface Annotation {
  startIndex: number
  length: number
  message: string
}
