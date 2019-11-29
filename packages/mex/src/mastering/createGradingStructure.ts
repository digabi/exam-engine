import { Element } from 'libxmljs2'
import { getAttribute, getNumericAttribute } from './utils'
import _ from 'lodash'

interface GradingStructure {
  questions: GradingStructureQuestion[]
}

type GradingStructureQuestion = TextQuestion

interface TextQuestion {
  type: 'text'
  id: number
  displayNumber: string
  maxScore: number
}

export function createGradingStructure(answers: Element[]): GradingStructure {
  const questions = _.flatMap(answers, answer => {
    switch (answer.name()) {
      case 'text-answer':
      case 'scored-text-answer':
        return mkTextQuestion(answer)
      default:
        return []
    }
  })

  return { questions }
}

function mkTextQuestion(answer: Element): TextQuestion {
  const id = getNumericAttribute('question-id', answer)!
  const displayNumber = getAttribute('display-number', answer)!
  const maxScore = getNumericAttribute('max-score', answer)!

  if (!id) {
    console.log(answer.toString())
    console.log(answer.parent().toString())
  }

  return {
    id,
    displayNumber,
    maxScore,
    type: 'text' as const
  }
}
