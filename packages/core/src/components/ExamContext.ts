import React from 'react'
import { getNumericAttribute, queryAll } from '../dom-utils'
import { ExamProps } from './Exam'
import { ExamServerAPI } from './types'
import { withContext } from './withContext'

export interface ExamContext {
  attachmentsURL: string
  examServerApi: ExamServerAPI
  resolveAttachment: (filename: string) => string
  root: Element
  date?: Date
  dateTimeFormatter: Intl.DateTimeFormat
  language: string
  maxAnswers?: number
  maxScore?: number
  numberOfSections: number
}

export const ExamContext = React.createContext<ExamContext>({} as ExamContext)

export const withExamContext = withContext<ExamContext, ExamProps>(
  ExamContext,
  ({ doc, language, attachmentsURL, resolveAttachment, examServerApi }) => {
    const root = doc.documentElement
    const maybeDate = root.getAttribute('date')

    return {
      attachmentsURL,
      examServerApi,
      resolveAttachment,
      root,
      date: maybeDate ? new Date(maybeDate) : undefined,
      dateTimeFormatter: new Intl.DateTimeFormat('fi-FI', { timeZone: 'UTC' }),
      language,
      maxAnswers: getNumericAttribute(root, 'max-answers'),
      maxScore: getNumericAttribute(root, 'max-score'),
      numberOfSections: queryAll(root, 'section').length
    }
  }
)
