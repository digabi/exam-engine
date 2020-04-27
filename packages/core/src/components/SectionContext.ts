import React from 'react'
import { getNumericAttribute, mapChildElements } from '../dom-utils'
import { withContext } from './withContext'
import { ExamComponentProps } from '../createRenderChildNodes'

export interface SectionContext {
  casForbidden: boolean
  displayNumber: string
  maxAnswers?: number
  minAnswers?: number
  maxScore: number
  childQuestions: Element[]
}

export const SectionContext = React.createContext<SectionContext>({} as SectionContext)

export const withSectionContext = withContext<SectionContext, ExamComponentProps>(SectionContext, ({ element }) => {
  const casForbidden = element.getAttribute('cas-forbidden') === 'true'
  const displayNumber = element.getAttribute('display-number')!
  const maxAnswers = getNumericAttribute(element, 'max-answers')!
  const minAnswers = getNumericAttribute(element, 'min-answers')!
  const maxScore = getNumericAttribute(element, 'max-score')!
  const childQuestions = mapChildElements(element, (childElement) => childElement).filter(
    (parentNode) => parentNode.localName === 'question'
  )

  return {
    casForbidden,
    displayNumber,
    maxAnswers,
    minAnswers,
    maxScore,
    childQuestions,
  }
})
