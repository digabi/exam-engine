import React from 'react'
import { ExamProps } from './Exam'
import { ExamServerAPI } from './types'
import { withContext } from './withContext'

export interface ExamContext {
  casCountdownDuration: number
  examServerApi: ExamServerAPI
}

export const ExamContext = React.createContext({} as ExamContext)

export const withExamContext = withContext<ExamContext, ExamProps>(ExamContext, (props: ExamProps) => {
  const { casCountdownDuration, examServerApi } = props

  return {
    casCountdownDuration: casCountdownDuration || 60,
    examServerApi
  }
})
