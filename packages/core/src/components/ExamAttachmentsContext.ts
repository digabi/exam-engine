import React from 'react'
import { CommonExamProps } from './Exam'
import { withContext } from './withContext'

export interface ExamAttachmentsContext {
  attachmentsURL: string
  resolveAttachment: (filename: string) => string
}

export const ExamAttachmentsContext = React.createContext<ExamAttachmentsContext>({} as ExamAttachmentsContext)

export function withExamAttachmentsContext<P extends CommonExamProps>(Component: React.ComponentType<P>) {
  return withContext<ExamAttachmentsContext, P>(ExamAttachmentsContext, ({ attachmentsURL, resolveAttachment }) => {
    return {
      attachmentsURL,
      resolveAttachment
    }
  })(Component)
}
