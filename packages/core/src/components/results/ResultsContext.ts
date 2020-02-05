import { ChoiceGroupChoice, ChoiceGroupQuestion, GradingStructure } from '@digabi/exam-engine-mastering'
import * as _ from 'lodash-es'
import React from 'react'
import { findChildrenAnswers, getNumericAttribute, parentElements, queryAll } from '../../dom-utils'
import { AnswerScore, ChoiceAnswer, ExamAnswer, QuestionId } from '../types'
import { withContext } from '../withContext'
import { ResultsProps } from './Results'

export interface ResultsContext {
  gradingStructure: GradingStructure
  scores: AnswerScore[]
  gradingText: string | undefined
  totalScore: number
}

export const ResultsContext = React.createContext<ResultsContext>({} as ResultsContext)

export const withResultsContext = withContext<ResultsContext, ResultsProps>(
  ResultsContext,
  ({ scores, doc, gradingStructure, gradingText, answers }) => {
    const topLevelQuestions = queryAll(doc.documentElement, 'question', false)
    const totalScore = _.sum(
      topLevelQuestions.map(question =>
        calculateQuestionSumScore(question, gradingStructure, scores, _.keyBy(answers, 'questionId'))
      )
    )

    return {
      gradingStructure,
      scores,
      totalScore,
      gradingText
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

export function calculateQuestionSumScore(
  questionElement: Element,
  gradingStructure: GradingStructure,
  scores: AnswerScore[],
  answersById: Record<QuestionId, ExamAnswer>
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
    findChildrenAnswers(questionElement).map(answer => {
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
  if (parentElements(questionElement, 'question').length === 0 && sumScore < 0) {
    return 0
  }
  return sumScore
}
