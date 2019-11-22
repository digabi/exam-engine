import React from 'react'
import { findChildElementByLocalName, getNumericAttribute, parentElements } from '../dom-utils'
import { ExamComponentProps } from './types'
import { withContext } from './withContext'

export interface QuestionContext {
  displayNumber: string
  hasExternalMaterial: boolean
  maxAnswers?: number
  maxScore: number
  level: number
  childQuestions: Element[]
}

export const QuestionContext = React.createContext<QuestionContext>({} as QuestionContext)

export const withQuestionContext = withContext<QuestionContext, ExamComponentProps>(QuestionContext, ({ element }) => {
  const childQuestions = Array.from(element.querySelectorAll('question')).filter(
    childQuestion => childQuestion.parentElement!.closest('question') === element
  )

  return {
    displayNumber: element.getAttribute('display-number')!,
    hasExternalMaterial: findChildElementByLocalName(element, 'external-material') != null,
    maxAnswers: getNumericAttribute(element, 'max-answers'),
    maxScore: getNumericAttribute(element, 'max-score')!,
    level: parentElements(element).filter(parent => parent.localName === 'question').length,
    childQuestions
  }
})
