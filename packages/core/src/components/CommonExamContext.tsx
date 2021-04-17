import React from 'react'
import { getNumericAttribute, queryAll } from '../dom-utils'
import { CommonExamProps } from './Exam'
import { withContext } from './withContext'

export interface CommonExamContext {
  attachmentsURL: string
  date?: Date
  dateTimeFormatter: Intl.DateTimeFormat
  /** The language of the exam. */
  language: string
  /** The language of the subject matter. Differs from the language in foreign language exams. */
  subjectLanguage: string
  maxAnswers?: number
  maxScore?: number
  numberOfSections: number
  resolveAttachment: (filename: string) => string
  root: Element
}

export const CommonExamContext = React.createContext({} as CommonExamContext)

export function withCommonExamContext<P extends CommonExamProps>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return withContext<CommonExamContext, P>(CommonExamContext, ({ attachmentsURL, resolveAttachment, doc }) => {
    const root = doc.documentElement
    const maybeDate = root.getAttribute('date')
    const language = root.getAttribute('exam-lang')!
    const subjectLanguage = root.getAttribute('lang') || language

    return {
      attachmentsURL,
      date: maybeDate ? new Date(maybeDate) : undefined,
      dateTimeFormatter: new Intl.DateTimeFormat('fi-FI', { timeZone: 'UTC' }),
      language,
      subjectLanguage,
      maxAnswers: getNumericAttribute(root, 'max-answers'),
      maxScore: getNumericAttribute(root, 'max-score'),
      numberOfSections: queryAll(root, 'section').length,
      resolveAttachment,
      root,
    }
  })(Component)
}
