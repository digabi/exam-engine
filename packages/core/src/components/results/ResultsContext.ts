import { ChoiceGroupChoice, ChoiceGroupQuestion, GradingStructure } from '@digabi/exam-engine-mastering'
import * as _ from 'lodash-es'
import React from 'react'
import { findChildrenAnswers, getNumericAttribute, queryAll } from '../../dom-utils'
import { AnswerScore, ChoiceAnswer, ExamAnswer, QuestionId } from '../types'
import { withContext } from '../withContext'
import { ResultsProps } from './Results'

export interface ResultsContext {
  gradingStructure: GradingStructure
  scores: AnswerScore[]
  gradingText: string | undefined
  totalScore: number
  root: Element
  date?: Date
  dateTimeFormatter: Intl.DateTimeFormat
  language: string
  maxAnswers?: number
  maxScore?: number
  numberOfSections: number
}

export const ResultsContext = React.createContext<ResultsContext>({} as ResultsContext)

export const withResultsContext = withContext<ResultsContext, ResultsProps>(
  ResultsContext,
  ({ gradingStructure, scores, gradingText, doc, language}) => {
    const totalScore = scores ? _.sum(scores.map(s => s.scoreValue)) : 0
    const root = doc.documentElement
    const nonNullScores = scores || []
    const maybeDate = root.getAttribute('date')

    return {
      gradingStructure,
      scores: nonNullScores,
      totalScore,
      gradingText,
      root,
      date: maybeDate ? new Date(maybeDate) : undefined,
      dateTimeFormatter: new Intl.DateTimeFormat('fi-FI', { timeZone: 'UTC' }),
      language,
      maxAnswers: getNumericAttribute(root, 'max-answers'),
      maxScore: getNumericAttribute(root, 'max-score'),
      numberOfSections: queryAll(root, 'section').length
    }
  }
)

export function findMultiChoiceFromGradingStructure(
  gradingStructure: GradingStructure,
  id: number
): ChoiceGroupChoice | undefined {
  const choiceGroups = gradingStructure.questions.filter(v => v.type === 'choicegroup')

  for (let i = 0, length = choiceGroups.length; i < length; i++) {
    const choiceGroup = choiceGroups[i] as ChoiceGroupQuestion
    for (let j = 0, choicesLength = choiceGroup.choices.length; j < choicesLength; j++) {
      if (choiceGroup.choices[j].id === id) {
        return choiceGroup.choices[j]
      }
    }
  }
  return undefined
}

export function findScore(scores: AnswerScore[], questionId: number) {
  return scores.find(s => s.questionId === questionId)
}

export function calculateSumScore(
  element: Element,
  gradingStructure: GradingStructure,
  scores: AnswerScore[],
  answersById: Record<QuestionId, ExamAnswer>,
  isTopLevel: boolean
) {
  const choiceQuestionScore = (questionId: number, scoredAnswer: ChoiceAnswer) => {
    const choice = findMultiChoiceFromGradingStructure(gradingStructure, questionId)
    return choice ? choice.options.find(o => o.id === Number(scoredAnswer.value))!.score : 0
  }

  const textQuestionScore = (questionId: number) => {
    const score = findScore(scores, questionId)
    return score ? score.scoreValue : 0
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
