import React from 'react'
import { getAttribute, getNumericAttribute, queryAll } from '../../dom-utils'
import { CommonExamProps } from '../exam/Exam'
import { withContext } from './withContext'

export interface CommonExamContext {
  attachmentsURL: string
  date?: Date
  dateTimeFormatter: Intl.DateTimeFormat
  dayCode?: string
  examCode?: string
  /** The language of the exam. */
  language: string
  /** The language of the subject matter. Differs from the language in foreign language exams. */
  subjectLanguage: string
  maxAnswers?: number
  maxScore?: number
  sections: Element[]
  resolveAttachment: (filename: string) => string
  root: Element
  abitti2: boolean
}

export const CommonExamContext = React.createContext({} as CommonExamContext)

export function withCommonExamContext<P extends CommonExamProps>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return withContext<CommonExamContext, P>(CommonExamContext, ({ attachmentsURL, resolveAttachment, doc, abitti2 }) => {
    const root = doc.documentElement
    const maybeDate = getAttribute(root, 'date')
    const language = getAttribute(root, 'exam-lang')!
    const subjectLanguage = getAttribute(root, 'lang') || language

    return {
      attachmentsURL,
      date: maybeDate ? new Date(maybeDate) : undefined,
      dateTimeFormatter: new Intl.DateTimeFormat('fi-FI', { timeZone: 'UTC' }),
      dayCode: getAttribute(root, 'day-code'),
      examCode: getAttribute(root, 'exam-code'),
      language,
      subjectLanguage,
      maxAnswers: getNumericAttribute(root, 'max-answers'),
      maxScore: getNumericAttribute(root, 'max-score'),
      sections: queryAll(root, 'section'),
      resolveAttachment,
      abitti2: abitti2 || false,
      root
    }
  })(Component)
}
