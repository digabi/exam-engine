import React from 'react'
import { findChildElement, getNumericAttribute, parentElements, queryAll } from '../dom-utils'
import { ExamComponentProps } from './types'
import { withContext } from './withContext'

export interface QuestionContext {
  answers: Element[]
  displayNumber: string
  hasExternalMaterial: boolean
  maxAnswers?: number
  maxScore: number
  level: number
  childQuestions: Element[]
}

export const QuestionContext = React.createContext<QuestionContext>({} as QuestionContext)

export const withQuestionContext = withContext<QuestionContext, ExamComponentProps>(QuestionContext, ({ element }) => {
  const childQuestions = queryAll(element, 'question', false)
  const answers = childQuestions.length
    ? []
    : queryAll(element, ['text-answer', 'scored-text-answer', 'dropdown-answer', 'choice-answer'], false)

  return {
    answers,
    displayNumber: element.getAttribute('display-number')!,
    hasExternalMaterial: findChildElement(element, 'external-material') != null,
    maxAnswers: getNumericAttribute(element, 'max-answers'),
    maxScore: getNumericAttribute(element, 'max-score')!,
    level: parentElements(element, 'question').length,
    childQuestions
  }
})
