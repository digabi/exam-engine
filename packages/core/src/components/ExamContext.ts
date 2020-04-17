import React from 'react'
import { ExamProps } from './Exam'
import { withContext } from './withContext'
import { ExamServerAPI } from '../types/ExamServerAPI'

export interface ExamContext {
  casCountdownDuration: number
  examServerApi: ExamServerAPI
}

export const ExamContext = React.createContext({} as ExamContext)

export const withExamContext = withContext<ExamContext, ExamProps>(ExamContext, (props: ExamProps) => {
  const { casCountdownDuration, examServerApi } = props

  return {
    casCountdownDuration: casCountdownDuration || 60,
    examServerApi,
  }
})
