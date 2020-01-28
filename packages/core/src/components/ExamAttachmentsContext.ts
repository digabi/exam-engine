import React from 'react'
import { ExamProps } from './Exam'
import { ExamResultsProps } from './results/ExamResults'
import { withContext } from './withContext'

export interface ExamAttachmentsContext {
  attachmentsURL: string
  resolveAttachment: (filename: string) => string
}

export const ExamAttachmentsContext = React.createContext<ExamAttachmentsContext>({} as ExamAttachmentsContext)

export const withAttachmentsContextForResults = withContext<ExamAttachmentsContext, ExamResultsProps>(
  ExamAttachmentsContext,
  ({ attachmentsURL, resolveAttachment }) => {
    return {
      attachmentsURL,
      resolveAttachment
    }
  }
)

export const withAttachmentsContextForExam = withContext<ExamAttachmentsContext, ExamProps>(
  ExamAttachmentsContext,
  ({ attachmentsURL, resolveAttachment }) => {
    return {
      attachmentsURL,
      resolveAttachment
    }
  }
)
