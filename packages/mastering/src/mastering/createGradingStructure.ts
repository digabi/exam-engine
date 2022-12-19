import {
  ChoiceGroupChoice,
  ChoiceGroupOption,
  ChoiceGroupQuestion,
  GradingStructure,
  GradingStructureQuestion,
  TextQuestion,
} from '@digabi/exam-engine-core'
import { Element } from 'libxmljs2'
import _ from 'lodash'
import { GenerateId } from '.'
import { Answer, choiceAnswerOptionTypes, Exam, ns, Question } from './schema'
import { getAttribute, getNumericAttribute, xpathOr } from './utils'

export function createGradingStructure(exam: Exam, generateId: GenerateId): GradingStructure {
  const questions = _.chain(exam.topLevelQuestions)
    .flatMap((question) => {
      const questionAnswers = collectAnswers(question)
      return _.chain(questionAnswers)
        .groupBy(getQuestionType)
        .flatMap((answers, questionType): GradingStructureQuestion[] => {
          switch (questionType) {
            case 'text':
              return answers.map(mkTextQuestion)
            case 'choice':
              return answers.map((answer) => mkChoiceGroupQuestion(answer, generateId))
            default:
              throw new Error(`Bug: grading structure generation not implemented for ${questionType}`)
          }
        })
        .value()
    })
    .sortBy(displayNumberDigits)
    .value()

  return { questions }
}

function collectAnswers(question: Question): Answer[] {
  return question.childQuestions.length ? _.flatMap(question.childQuestions, collectAnswers) : question.answers
}

function getQuestionType(answer: Answer): 'text' | 'choice' {
  const answerType = answer.element.name()

  switch (answerType) {
    case 'text-answer':
    case 'scored-text-answer':
      return 'text'
    case 'choice-answer':
    case 'dropdown-answer':
      return 'choice'
    default:
      throw new Error(`getQuestionType not implemented for ${answerType}`)
  }
}

function mkTextQuestion(answer: Answer): TextQuestion {
  const type = answer.element.name()
  const id = getNumericAttribute('question-id', answer.element)
  const displayNumber = getAttribute('display-number', answer.element)
  const maxScore = getNumericAttribute('max-score', answer.element)
  const maxLength = getNumericAttribute('max-length', answer.element, undefined)

  const question = {
    id,
    displayNumber,
    maxScore,
    type: 'text' as const,
    ...(maxLength && { maxLength }),
  }

  if (type === 'text-answer') {
    return question
  } else {
    const correctAnswers = answer.element
      .find<Element>('./e:accepted-answer', ns)
      .map((e) => ({ text: e.text(), score: getNumericAttribute('score', e) }))
    return { ...question, correctAnswers }
  }
}

function mkChoiceGroupQuestion(answer: Answer, generateId: GenerateId): ChoiceGroupQuestion {
  const questionId = getNumericAttribute('question-id', answer.element)
  const displayNumber = getAttribute('display-number', answer.element)
  const maxScore = getNumericAttribute('max-score', answer.element)

  const options: ChoiceGroupOption[] = answer.element
    .find<Element>(xpathOr(choiceAnswerOptionTypes), ns)
    .map((option) => {
      const id = getNumericAttribute('option-id', option)
      const score = getNumericAttribute('score', option, 0)
      const correct = score > 0 && score === maxScore
      return { id, score, correct }
    })

  const choice: ChoiceGroupChoice = {
    id: questionId,
    displayNumber,
    type: 'choice',
    options,
  }

  return { id: generateId(), displayNumber: displayNumber, type: 'choicegroup', choices: [choice] }
}

const getDigit =
  (digit: number) =>
  (question: GradingStructureQuestion): number =>
    Number(question.displayNumber.split('.')[digit]) || -1

const displayNumberDigits = [getDigit(0), getDigit(1), getDigit(2), getDigit(3), getDigit(4)]
