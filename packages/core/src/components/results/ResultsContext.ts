import { ChoiceGroupChoice, ChoiceGroupQuestion, GradingStructure } from '@digabi/exam-engine-mastering'
import * as _ from 'lodash-es'
import React from 'react'
import { findChildrenAnswers, getNumericAttribute, parentElements, queryAll } from '../../dom-utils'
import { AnswerWithScores, AutogradedScore, ChoiceAnswer, ExamAnswer, PregradingScore, QuestionId } from '../types'
import { withContext } from '../withContext'
import { ResultsProps } from './Results'

export interface ResultsContext {
  answersByQuestionId: Record<QuestionId, ExamAnswer>
  gradingStructure: GradingStructure
  scores: AnswerWithScores[]
  gradingText: string | undefined
  totalScore: number
}

export const ResultsContext = React.createContext<ResultsContext>({} as ResultsContext)

export const withResultsContext = withContext<ResultsContext, ResultsProps>(
  ResultsContext,
  ({ scores, doc, gradingStructure, gradingText, answers }) => {
    const answersByQuestionId = _.keyBy(answers, 'questionId')
    const topLevelQuestions = queryAll(doc.documentElement, 'question', false)
    const totalScore = _.sum(
      topLevelQuestions.map(question =>
        calculateQuestionSumScore(question, gradingStructure, scores, answersByQuestionId)
      )
    )

    return {
      answersByQuestionId,
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

export function findScore(scores: AnswerWithScores[], questionId: number): AnswerWithScores | undefined {
  return scores.find(a => a.questionId === questionId)
}

export function findPregradingScore(scores: AnswerWithScores[], questionId: number): PregradingScore | undefined {
  const pregradingScore = scores.find(a => a.questionId === questionId)?.pregrading
  return pregradingScore?.score ? pregradingScore : undefined
}

export function findAutogradingScore(scores: AnswerWithScores[], questionId: number): AutogradedScore | undefined {
  const autogradingScore = scores.find(a => a.questionId === questionId)?.autograding
  return autogradingScore?.score ? autogradingScore : undefined
}

export function calculateQuestionSumScore(
  questionElement: Element,
  gradingStructure: GradingStructure,
  scores: AnswerWithScores[],
  answersById: Record<QuestionId, ExamAnswer>
) {
  const choiceQuestionScore = (questionId: number, scoredAnswer: ChoiceAnswer) => {
    const choice = findMultiChoiceFromGradingStructure(gradingStructure, questionId)
    return choice ? choice.options.find(o => o.id === Number(scoredAnswer.value))!.score : 0
  }

  const textQuestionScore = (questionId: number) => {
    const score = findPregradingScore(scores, questionId)
    return score ? score.score : 0
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
