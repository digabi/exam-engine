import * as _ from 'lodash-es'
import React from 'react'
import { withContext } from '../withContext'
import { ExamResultsProps } from './ExamResults'

export interface ExamResultsContext {
  gradingStructure: any
  gradingText: string | undefined
  totalScore: number
}

export const ExamResultsContext = React.createContext<ExamResultsContext>({} as ExamResultsContext)

export const withExamResultsContext = withContext<ExamResultsContext, ExamResultsProps>(
  ExamResultsContext,
  ({ gradingStructure, scores, gradingText }) => {
    const totalScore = scores ? _.sum(scores.map((s: { scoreValue: number }) => s.scoreValue)) : 0

    return {
      gradingStructure: mergeScoresToGradingStructure(gradingStructure, scores),
      totalScore,
      gradingText
    }
  }
)

export function findMultiChoice(gradingStructure: any[], id: number) {
  const choiceGroups = gradingStructure.filter((q: { type: string }) => q.type === 'choicegroup')
  for (let i = 0, length = choiceGroups.length; i < length; i++) {
    for (let j = 0, choicesLength = choiceGroups[i].choices.length; j < choicesLength; j++) {
      if (choiceGroups[i].choices[j].id === id) {
        return choiceGroups[i].choices[j]
      }
    }
  }
}

function mergeScoresToGradingStructure(gradingStructure: { questions: any[] }, scores: any[]) {
  return gradingStructure.questions.map(question => {
    const score = scores.find((score: { questionId: number }) => score.questionId === question.id)
    return score ? { ...question, scoreValue: score.scoreValue } : question
  })
}

