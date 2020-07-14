import React from 'react'
import { getNumericAttribute, queryAll } from '../dom-utils'
import { CommonExamProps } from './Exam'
import { withContext } from './withContext'

export interface CommonExamContext {
  attachmentsURL: string
  date?: Date
  dateTimeFormatter: Intl.DateTimeFormat
  language: string
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
  return withContext<CommonExamContext, P>(
    CommonExamContext,
    ({ attachmentsURL, resolveAttachment, doc, language }) => {
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
        numberOfSections: queryAll(root, 'section').length,
      }
    }
  )(Component)
}
