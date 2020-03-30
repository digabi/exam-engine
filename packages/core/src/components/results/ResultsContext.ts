import { ChoiceGroupChoice, ChoiceGroupQuestion, GradingStructure } from '@digabi/exam-engine-mastering'
import * as _ from 'lodash-es'
import React from 'react'
import { findChildrenAnswers, getNumericAttribute, parentElements, queryAll } from '../../dom-utils'
import { ChoiceAnswer, ExamAnswer, QuestionId, Score } from '../types'
import { withContext } from '../withContext'
import { ResultsProps } from './Results'

export interface ResultsContext {
  answersByQuestionId: Record<QuestionId, ExamAnswer>
  gradingStructure: GradingStructure
  scores: Score[]
  gradingText: string | undefined
  totalScore: number
  singleGrading?: boolean
}

export const ResultsContext = React.createContext<ResultsContext>({} as ResultsContext)

export const withResultsContext = withContext<ResultsContext, ResultsProps>(
  ResultsContext,
  ({ scores, doc, gradingStructure, gradingText, answers, singleGrading }) => {
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
      gradingText,
      singleGrading
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

export function findScore(scores: Score[], questionId: number): Score | undefined {
  return scores.find(a => a.questionId === questionId)
}

export function calculateQuestionSumScore(
  questionElement: Element,
  gradingStructure: GradingStructure,
  scores: Score[],
  answersById: Record<QuestionId, ExamAnswer>
) {
  const choiceQuestionScore = (questionId: number, scoredAnswer: ChoiceAnswer) => {
    const choice = findMultiChoiceFromGradingStructure(gradingStructure, questionId)
    return choice ? choice.options.find(o => o.id === Number(scoredAnswer.value))!.score : 0
  }

  const textQuestionScore = (questionId: number) => {
    const score = findScore(scores, questionId)?.pregrading
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
