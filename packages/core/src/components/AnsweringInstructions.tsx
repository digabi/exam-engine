import * as _ from 'lodash-es'
import React from 'react'
import { useTranslation } from 'react-i18next'
export interface AnsweringInstructionProps {
  maxAnswers: number
  /** Child questions as either raw Elements from the XML or just display numbers. */
  childQuestions: (string | Element)[]
  type: 'exam' | 'question' | 'section' | 'toc-section'
  minAnswers?: number
}

function AnsweringInstructions({ maxAnswers, minAnswers, type, childQuestions }: AnsweringInstructionProps) {
  const childDisplayNumbers = childQuestions.map((question) =>
    _.isString(question) ? question : question.getAttribute('display-number')!
  )

  const { t } = useTranslation()
  const possibleTranslationStrings = cartesian(
    [childDisplayNumbers.length, '*'],
    [maxAnswers, '*'],
    [minAnswers != null ? minAnswers : maxAnswers, '*']
  ).map(
    ([childQuestionCount, maxAnswerCount, minAnswerCount]) =>
      `answering-instructions.${type}_${childQuestionCount}_${minAnswerCount}_${maxAnswerCount}`
  )
  const answerCount = [minAnswers, maxAnswers]
  const questions = [_.first(childDisplayNumbers)!, _.last(childDisplayNumbers)!]
  return <>{t(possibleTranslationStrings, { answerCount, questions })}</>
}

function cartesian<A>(as: A[]): A[]
function cartesian<A, B>(as: A[], bs: B[]): [A, B][]
function cartesian<A, B, C>(as: A[], bs: B[], cs: C[]): [A, B, C][]
function cartesian(...arrays: any[]): any[][] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  return arrays.reduce((a, b) => _.flatMap(a, (x) => b.map((y: any) => x.concat([y]))), [[]])
}

export default React.memo(AnsweringInstructions)
