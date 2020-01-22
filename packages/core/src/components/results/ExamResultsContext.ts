import React from 'react'
import { withContext } from '../withContext'
import { ExamResultsProps } from './ExamResults'

export interface ExamResultsContext {
  gradingStructure: any
}

export const ExamResultsContext = React.createContext<ExamResultsContext>({} as ExamResultsContext)

export const withExamResultsContext = withContext<ExamResultsContext, ExamResultsProps>(
  ExamResultsContext,
  ({ gradingStructure }) => {
    return {
      gradingStructure
    }
  }
)

export function findMultiChoice(questions: any[], id: number) {
  const choiceGroups = questions.filter((q: { type: string }) => q.type === 'choicegroup')
  for (let i = 0, length = choiceGroups.length; i < length; i++) {
    for (let j = 0, choicesLength = choiceGroups[i].choices.length; j < choicesLength; j++) {
      if (choiceGroups[i].choices[j].id === id) {
        return choiceGroups[i].choices[j]
      }
    }
  }
}
