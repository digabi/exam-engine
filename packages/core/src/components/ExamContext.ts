import React from 'react'
import { getNumericAttribute, queryAll } from '../dom-utils'
import { ExamProps } from './Exam'
import { ResultsProps } from './results/Results'
import { ExamServerAPI } from './types'
import { withContext } from './withContext'

export interface ExamContext {
  casCountdownDuration: number
  examServerApi: ExamServerAPI
  root: Element
  date?: Date
  dateTimeFormatter: Intl.DateTimeFormat
  language: string
  maxAnswers?: number
  maxScore?: number
  numberOfSections: number
}

export const ExamContext = React.createContext<ExamContext>({} as ExamContext)

export const withExamContext = withContext<ExamContext, ExamProps>(ExamContext, (props: ExamProps) => {
  const { casCountdownDuration, examServerApi } = props
  const common = commonExamContext(props)

  return {
    ...common,
    casCountdownDuration: casCountdownDuration || 60,
    examServerApi
  }
})

export function commonExamContext(props: ExamProps | ResultsProps) {
  const { attachmentsURL, resolveAttachment, doc, language } = props
  const root = doc.documentElement
  const maybeDate = root.getAttribute('date')

  return {
    attachmentsURL,
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
