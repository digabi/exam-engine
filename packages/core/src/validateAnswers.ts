import { ExamElement, RootElement } from './parser/parseExamStructure'
import { ExamAnswer, QuestionId } from './types/ExamAnswer'
import * as _ from 'lodash-es'
import { AnsweringInstructionProps } from './components/AnsweringInstructions'

export interface ExtraAnswer extends AnsweringInstructionProps {
  displayNumber: string
}

export function validateAnswers(
  examStructure: RootElement,
  answersById: Record<QuestionId, ExamAnswer>
): ExtraAnswer[] {
  // A recursive function that that calculates the answer count at each level
  // (answerCount) and carries around an array of extra answers
  function go(element: ExamElement): { answerCount: number; displayNumber: string; extraAnswers: ExtraAnswer[] } {
    const displayNumber = element.name === 'exam' ? '' : element.attributes.displayNumber

    switch (element.name) {
      case 'exam':
      case 'section':
      case 'question': {
        const children = element.childNodes.map(go)
        const childrenWithAnswers = children.filter((v) => v.answerCount > 0)
        const maxAnswers = element.attributes.maxAnswers ?? Infinity
        // Currently, min-answers exists only at section level.
        const minAnswers = element.name === 'section' ? element.attributes.minAnswers : undefined
        // At exam level, answer count is the sum of answer counts of each
        // section. At section and question levels, answer count is the number
        // of child questions that have _any_ answers.
        const answerCount =
          element.name === 'exam'
            ? childrenWithAnswers.reduce((acc, section) => acc + section.answerCount, 0)
            : childrenWithAnswers.length
        const childExtraAnswers = _.flatMap(children, (v) => v.extraAnswers)
        // If there are extra answers on the current level, we prepend them to
        // the extra answers array, so it is ordered naturally in document
        // order.
        const extraAnswers =
          answerCount > maxAnswers
            ? [
                {
                  type: element.name,
                  displayNumber,
                  childQuestions: children.map((v) => v.displayNumber),
                  maxAnswers,
                  minAnswers,
                },
                ...childExtraAnswers,
              ]
            : childExtraAnswers

        return { answerCount, displayNumber, extraAnswers }
      }
      case 'text-answer':
      case 'scored-text-answer':
      case 'choice-answer':
      case 'dropdown-answer': {
        const maybeAnswer = answersById[element.attributes.questionId]
        // An answer whose value is '' is considered to be empty, so we ignore
        // them.
        const isValidAnswer = maybeAnswer?.value.length > 0
        return { answerCount: isValidAnswer ? 1 : 0, displayNumber, extraAnswers: [] }
      }
    }
  }

  return go(examStructure).extraAnswers
}
