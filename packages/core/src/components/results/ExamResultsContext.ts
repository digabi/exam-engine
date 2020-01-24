import * as _ from 'lodash-es'
import React from 'react'
import { findChildrenAnswers, getNumericAttribute } from '../../dom-utils'
import { ChoiceAnswer, ExamAnswer, QuestionId } from '../types'
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

export function findMultiChoiceFromGradingStructure(gradingStructure: any[], id: number) {
  const choiceGroups = gradingStructure.filter((q: { type: string }) => q.type === 'choicegroup')
  for (let i = 0, length = choiceGroups.length; i < length; i++) {
    for (let j = 0, choicesLength = choiceGroups[i].choices.length; j < choicesLength; j++) {
      if (choiceGroups[i].choices[j].id === id) {
        return choiceGroups[i].choices[j]
      }
    }
  }
}

export function calculateQuestionSumScore(
  element: Element,
  gradingStructure: any[],
  answersById: Record<QuestionId, ExamAnswer>,
  isTopLevel: boolean
) {
  const choiceQuestionScore = (questionId: number, scoredAnswer: ChoiceAnswer) => {
    const choice = findMultiChoiceFromGradingStructure(gradingStructure, questionId)
    return choice ? choice.options.find((o: { id: number }) => o.id === Number(scoredAnswer.value)).score : 0
  }

  const textQuestionScore = (questionId: number) => {
    const text = gradingStructure.find((q: { id: number }) => q.id === questionId)
    return text ? text.scoreValue : 0
  }

  const sumScore = _.sum(
    findChildrenAnswers(element).map(answer => {
      const questionId = getNumericAttribute(answer, 'question-id')!
      const scoredAnswer = answersById[questionId]
      if (!scoredAnswer) {
        return 0
      }
      if (scoredAnswer.type === 'choice') {
        return choiceQuestionScore(questionId, scoredAnswer)
      } else {
        return textQuestionScore(questionId)
      }
    })
  )
  // top level questions may not yield negative scores
  if (isTopLevel && sumScore < 0) {
    return 0
  }
  return sumScore
}

function mergeScoresToGradingStructure(gradingStructure: { questions: any[] }, scores: any[]) {
  return gradingStructure.questions.map(question => {
    const score = scores.find((score: { questionId: number }) => score.questionId === question.id)
    return score ? { ...question, scoreValue: score.scoreValue } : question
  })
}

