import * as _ from 'lodash-es'
import React from 'react'
import { findChildrenAnswers, getNumericAttribute } from '../../dom-utils'
import {
  AnswerScore,
  ChoiceAnswer,
  ChoiceGrading,
  ExamAnswer,
  GradingStructure,
  QuestionChoice,
  QuestionGrading,
  QuestionId
} from '../types'
import { withContext } from '../withContext'
import { ExamResultsProps } from './ExamResults'

export interface ExamResultsContext {
  gradingStructure: GradingStructure
  gradingText: string | undefined
  totalScore: number
}

export const ExamResultsContext = React.createContext<ExamResultsContext>({} as ExamResultsContext)

export const withExamResultsContext = withContext<ExamResultsContext, ExamResultsProps>(
  ExamResultsContext,
  ({ gradingStructure, scores, gradingText }) => {
    const totalScore = scores ? _.sum(scores.map(s => s.scoreValue)) : 0

    const scoresAndGrades = gradingStructure
      ? scores
        ? mergeScoresToGradingStructure(gradingStructure, scores)
        : gradingStructure
      : []

    return {
      gradingStructure: scoresAndGrades,
      totalScore,
      gradingText
    }
  }
)

export function findMultiChoiceFromGradingStructure(
  gradingStructure: GradingStructure,
  id: number
): QuestionChoice | undefined {
  const choiceGroups = gradingStructure.filter(q => q.type === 'choicegroup') as ChoiceGrading[]
  for (let i = 0, length = choiceGroups.length; i < length; i++) {
    for (let j = 0, choicesLength = choiceGroups[i].choices.length; j < choicesLength; j++) {
      if (choiceGroups[i].choices[j].id === id) {
        return choiceGroups[i].choices[j]
      }
    }
  }
  return undefined
}

export function calculateQuestionSumScore(
  element: Element,
  gradingStructure: GradingStructure,
  answersById: Record<QuestionId, ExamAnswer>,
  isTopLevel: boolean
) {
  const choiceQuestionScore = (questionId: number, scoredAnswer: ChoiceAnswer) => {
    const choice = findMultiChoiceFromGradingStructure(gradingStructure, questionId)
    return choice ? choice.options.find(o => o.id === Number(scoredAnswer.value))!.score : 0
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

function mergeScoresToGradingStructure(gradingStructure: GradingStructure, scores: AnswerScore[]): QuestionGrading[] {
  return gradingStructure.map(question => {
    const score = scores.find(s => s.questionId === question.id)
    return score ? { ...question, scoreValue: score.scoreValue } : question
  })
}
