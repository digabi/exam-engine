import { Element } from 'libxmljs2'
import _ from 'lodash'
import { GenerateId } from '.'
import { Answer, choiceAnswerOptionTypes, Exam, ns } from './schema'
import { asElements, getAttribute, getNumericAttribute, xpathOr } from './utils'

export interface GradingStructure {
  questions: GradingStructureQuestion[]
}

type GradingStructureQuestion = TextQuestion | ChoiceGroupQuestion

interface TextQuestion {
  type: 'text'
  id: number
  displayNumber: string
  maxScore: number
}

interface ChoiceGroupQuestion {
  type: 'choicegroup'
  id: number
  displayNumber: string
  choices: ChoiceGroupChoice[]
}

interface ChoiceGroupChoice {
  id: number
  displayNumber: string
  type: 'choice'
  options: ChoiceGroupOption[]
}

interface ChoiceGroupOption {
  id: number
  correct: boolean
  score: number
}

export function createGradingStructure(exam: Exam, generateId: GenerateId): GradingStructure {
  const questions = _.chain(exam.answers)
    .groupBy(a => getAttribute('display-number', a.question))
    .flatMap((questionAnswers, questionDisplayNumber) =>
      _.chain(questionAnswers)
        .groupBy(answer => answer.element.name())
        .flatMap((answers, answerType): GradingStructureQuestion[] => {
          switch (answerType) {
            case 'text-answer':
            case 'scored-text-answer':
              return answers.map(a => mkTextQuestion(a.element))
            case 'choice-answer':
            case 'dropdown-answer':
              return [mkChoiceGroupQuestion(answers, questionDisplayNumber, generateId)]
            default:
              throw new Error(`Bug: grading structure generation not implemented for ${answerType}`)
          }
        })
        .value()
    )
    .sortBy(displayNumberDigits)
    .value()

  return { questions }
}

function mkTextQuestion(answer: Element): TextQuestion {
  const id = getNumericAttribute('question-id', answer)
  const displayNumber = getAttribute('display-number', answer)
  const maxScore = getNumericAttribute('max-score', answer)

  return {
    id,
    displayNumber,
    maxScore,
    type: 'text' as const
  }
}

function mkChoiceGroupQuestion(
  answers: Answer[],
  questionDisplayNumber: string,
  generateId: GenerateId
): ChoiceGroupQuestion {
  const choices: ChoiceGroupChoice[] = answers.map(answer => {
    const questionId = getNumericAttribute('question-id', answer.element)
    const displayNumber = getAttribute('display-number', answer.element)
    const maxScore = getNumericAttribute('max-score', answer.element)

    const options: ChoiceGroupOption[] = asElements(answer.element.find(xpathOr(choiceAnswerOptionTypes), ns)).map(
      option => {
        const id = getNumericAttribute('option-id', option)
        const score = getNumericAttribute('score', option, 0)
        const correct = score > 0 && score === maxScore
        return { id, score, correct }
      }
    )

    return {
      id: questionId,
      displayNumber,
      type: 'choice',
      options
    }
  })

  return { id: generateId(), displayNumber: questionDisplayNumber, type: 'choicegroup', choices }
}

const getDigit = (digit: number) => (question: GradingStructureQuestion): number =>
  Number(question.displayNumber.split('.')[digit])
const displayNumberDigits = [getDigit(0), getDigit(1), getDigit(2), getDigit(3), getDigit(4)]
