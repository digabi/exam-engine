import React from 'react'
import { ExamProps } from '../exam/Exam'
import { withContext } from './withContext'
import { ExamServerAPI } from '../../index'

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
