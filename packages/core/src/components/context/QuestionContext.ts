import React from 'react'
import { findChildElement, getNumericAttribute, parentElements, queryAll } from '../../dom-utils'
import { withContext } from './withContext'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { questionInstructionId, questionTitleId } from '../../ids'

export interface QuestionContext {
  answers: Element[]
  displayNumber: string
  hasExternalMaterial: boolean
  maxAnswers?: number
  maxScore: number
  level: number
  childQuestions: Element[]
  questionLabelIds: string
}

export const QuestionContext = React.createContext<QuestionContext>({} as QuestionContext)

export const withQuestionContext = withContext<QuestionContext, ExamComponentProps>(QuestionContext, ({ element }) => {
  const childQuestions = queryAll(element, 'question', false)
  const answers = childQuestions.length
    ? []
    : queryAll(element, ['text-answer', 'scored-text-answer', 'dropdown-answer', 'choice-answer', 'dnd-answer'], false)
  const questionInstructions = queryAll(element, 'question-instruction', false)
  const displayNumber = element.getAttribute('display-number')!
  const questionLabelIds =
    questionInstructions.length > 0
      ? questionInstructions.map(questionInstructionId).join(' ')
      : questionTitleId(displayNumber)

  return {
    answers,
    displayNumber,
    hasExternalMaterial: findChildElement(element, 'external-material') != null,
    maxAnswers: getNumericAttribute(element, 'max-answers'),
    maxScore: getNumericAttribute(element, 'max-score')!,
    level: parentElements(element, 'question').length,
    childQuestions,
    questionLabelIds
  }
})
