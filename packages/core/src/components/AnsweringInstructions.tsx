import * as _ from 'lodash-es'
import React from 'react'
import { useExamTranslation } from '../i18n'
export interface AnsweringInstructionProps {
  maxAnswers: number
  /** Child questions as either raw Elements from the XML or just display numbers. */
  childQuestions: (string | Element)[]
  elementType: 'exam' | 'question' | 'section' | 'toc-section'
  minAnswers?: number
}

function AnsweringInstructions({ maxAnswers, minAnswers, elementType, childQuestions }: AnsweringInstructionProps) {
  const childDisplayNumbers = childQuestions.map((question) =>
    _.isString(question) ? question : question.getAttribute('display-number')!
  )

  const { t } = useExamTranslation()
  const possibleTranslationStrings: any[] = cartesian(
    [childDisplayNumbers.length, '*'],
    [maxAnswers, '*'],
    [minAnswers != null ? minAnswers : maxAnswers, '*']
  ).map(
    ([childQuestionCount, maxAnswerCount, minAnswerCount]) =>
      `answering-instructions.${elementType}_${childQuestionCount}_${minAnswerCount}_${maxAnswerCount}`
  )
  const answerCount = [minAnswers, maxAnswers]
  const questions = [_.first(childDisplayNumbers)!, _.last(childDisplayNumbers)!]
  return <>{t(possibleTranslationStrings, { answerCount, questions })}</>
}

function cartesian<A, B, C>(as: readonly A[], bs: readonly B[], cs: readonly C[]): [A, B, C][] {
  const result: [A, B, C][] = []

  for (const a of as) {
    for (const b of bs) {
      for (const c of cs) {
        result.push([a, b, c])
      }
    }
  }

  return result
}

export default React.memo(AnsweringInstructions)
