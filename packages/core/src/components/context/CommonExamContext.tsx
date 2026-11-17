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
  examType: string
  /** The language of the subject matter. Differs from the language in foreign language exams. */
  subjectLanguage: string
  maxAnswers?: number
  maxScore?: number
  sections: Element[]
  resolveAttachment: (filename: string) => string
  /** Host-provided callback to open an attachment file instead of letting the browser follow the link. */
  onFileOpen?: (href: string) => void
  /** Set this to skip rendering an inline `<audio>`
   element in hosts that play restricted audio some other way */
  skipInlineRestrictedAudio?: boolean
  root: Element
}

export const CommonExamContext = React.createContext({} as CommonExamContext)

export function withCommonExamContext<P extends CommonExamProps>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return withContext<CommonExamContext, P>(
    CommonExamContext,
    ({ attachmentsURL, resolveAttachment, onFileOpen, skipInlineRestrictedAudio, doc }) => {
      const root = doc.documentElement
      const maybeDate = getAttribute(root, 'date')
      const language = getAttribute(root, 'exam-lang')!
      const examType = getAttribute(root, 'exam-type') ?? 'normal'
      const subjectLanguage = getAttribute(root, 'lang') || language

      return {
        attachmentsURL,
        date: maybeDate ? new Date(maybeDate) : undefined,
        dateTimeFormatter: new Intl.DateTimeFormat('fi-FI', { timeZone: 'UTC' }),
        dayCode: getAttribute(root, 'day-code'),
        examCode: getAttribute(root, 'exam-code'),
        language,
        subjectLanguage,
        examType,
        maxAnswers: getNumericAttribute(root, 'max-answers'),
        maxScore: getNumericAttribute(root, 'max-score'),
        sections: queryAll(root, 'section'),
        resolveAttachment,
        onFileOpen,
        skipInlineRestrictedAudio,
        root
      }
    }
  )(Component)
}
