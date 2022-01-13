import { validateAnswers } from '../src/validateAnswers'
import parseExam from '../src/parser/parseExam'
import { parseExamStructure, RootElement } from '../src/parser/parseExamStructure'
import { generateExam, question, textAnswer } from '@digabi/exam-engine-generator'
import { masterExam } from '@digabi/exam-engine-mastering'
import { ExamAnswer, GradingStructure } from '../src'
import * as _ from 'lodash'

let examStructure: RootElement
let gradingStructure: GradingStructure

beforeAll(async () => {
  const exam = generateExam({
    maxAnswers: 2,
    sections: [
      {
        questions: [
          question([textAnswer({ maxLength: 3 })]),
          question({ questions: [question([textAnswer({ maxLength: 3 })]), question([textAnswer()])] }),
        ],
      },
      {
        maxAnswers: 1,
        questions: [
          question([textAnswer()]),
          question({ maxAnswers: 1, questions: [question([textAnswer()]), question([textAnswer()])] }),
        ],
      },
    ],
  })
  const [masteringResult] = await masterExam(
    exam,
    () => '',
    () => {
      throw new Error('Boom!')
    }
  )
  examStructure = parseExamStructure(parseExam(masteringResult.xml))
  gradingStructure = masteringResult.gradingStructure
})

describe('Answer length validation', () => {
  it('returns an error if answer is too long', () => {
    expect(validateAnswers(examStructure, answerQuestionsWithText('too long', '1'))).toEqual([
      {
        displayNumber: '1',
        type: 'AnswerTooLong',
        characterCount: 8,
      },
    ])
  })
  it('returns multiple errors if multiple answers are too long', () => {
    expect(validateAnswers(examStructure, answerQuestionsWithText('too long', '1', '2.1'))).toEqual([
      {
        displayNumber: '1',
        type: 'AnswerTooLong',
        characterCount: 8,
      },
      {
        displayNumber: '2.1',
        type: 'AnswerTooLong',
        characterCount: 8,
      },
    ])
  })

  it('does not return errors if answer is short enough', () => {
    expect(validateAnswers(examStructure, answerQuestionsWithText('ok', '1'))).toEqual([])
  })
})

describe('Extra answers validation', () => {
  it('returns an empty array if answer combinations are valid, nonempty if invalid', () => {
    const allAnswerCombinations = subsets(['1', '2.1', '2.2', '3', '4.1', '4.2'])
    const validAnswerCombinations = [
      // No answers
      [],
      // 1 answer in 1st section
      ['1'],
      ['2.1'],
      ['2.2'],
      ['2.1', '2.2'],
      // 1 answer in 2nd section
      ['3'],
      ['4.1'],
      ['4.2'],
      // 2 answers in 1st section
      ['1', '2.1'],
      ['1', '2.2'],
      ['1', '2.1', '2.2'],
      // 1 answer in both sections
      ['1', '3'],
      ['2.1', '3'],
      ['2.2', '3'],
      ['2.1', '2.2', '3'],
      ['1', '4.1'],
      ['2.1', '4.1'],
      ['2.2', '4.1'],
      ['2.1', '2.2', '4.1'],
      ['1', '4.2'],
      ['2.1', '4.2'],
      ['2.2', '4.2'],
      ['2.1', '2.2', '4.2'],
    ]
    const invalidAnswerCombinations = _.differenceWith(allAnswerCombinations, validAnswerCombinations, _.isEqual)

    for (const questions of validAnswerCombinations) {
      expect(validateAnswers(examStructure, answerQuestions(...questions))).toEqual([])
    }

    for (const questions of invalidAnswerCombinations) {
      expect(validateAnswers(examStructure, answerQuestions(...questions))).not.toEqual([])
    }
  })

  it('returns an error if question has too many answers', () => {
    expect(validateAnswers(examStructure, answerQuestions('4.1', '4.2'))).toEqual([
      {
        childQuestions: ['4.1', '4.2'],
        displayNumber: '4',
        maxAnswers: 1,
        minAnswers: undefined,
        elementType: 'question',
        type: 'ExtraAnswer',
      },
    ])
  })

  it('returns an error if section has too many answers', () => {
    expect(validateAnswers(examStructure, answerQuestions('3', '4.1'))).toEqual([
      {
        childQuestions: ['3', '4'],
        displayNumber: '2',
        maxAnswers: 1,
        minAnswers: 0,
        elementType: 'section',
        type: 'ExtraAnswer',
      },
    ])
  })

  it('returns an error if exam has too many answers', () => {
    expect(validateAnswers(examStructure, answerQuestions('1', '2.1', '3'))).toEqual([
      {
        childQuestions: ['1', '2'],
        displayNumber: '',
        maxAnswers: 2,
        minAnswers: undefined,
        elementType: 'exam',
        type: 'ExtraAnswer',
      },
    ])
  })

  it('returns two errors if both exam and section have too many answers', () => {
    expect(validateAnswers(examStructure, answerQuestions('1', '3', '4.1'))).toEqual([
      {
        childQuestions: ['1', '2'],
        displayNumber: '',
        maxAnswers: 2,
        minAnswers: undefined,
        elementType: 'exam',
        type: 'ExtraAnswer',
      },
      {
        childQuestions: ['3', '4'],
        displayNumber: '2',
        maxAnswers: 1,
        minAnswers: 0,
        elementType: 'section',
        type: 'ExtraAnswer',
      },
    ])
  })

  it('returns three errors if exam, section and question have too many answers', () => {
    expect(validateAnswers(examStructure, answerQuestions('1', '3', '4.1', '4.2'))).toEqual([
      {
        childQuestions: ['1', '2'],
        displayNumber: '',
        maxAnswers: 2,
        minAnswers: undefined,
        elementType: 'exam',
        type: 'ExtraAnswer',
      },
      {
        childQuestions: ['3', '4'],
        displayNumber: '2',
        maxAnswers: 1,
        minAnswers: 0,
        elementType: 'section',
        type: 'ExtraAnswer',
      },
      {
        childQuestions: ['4.1', '4.2'],
        displayNumber: '4',
        maxAnswers: 1,
        minAnswers: undefined,
        elementType: 'question',
        type: 'ExtraAnswer',
      },
    ])
  })
})

const answerQuestions = (...displayNumbers: string[]): Record<number, ExamAnswer> => {
  return answerQuestionsWithText('foo', ...displayNumbers)
}

const answerQuestionsWithText = (text: string, ...displayNumbers: string[]): Record<number, ExamAnswer> => {
  const findQuestionId = (displayNumber: string) =>
    gradingStructure.questions.find((q) => q.displayNumber === displayNumber)!.id

  const createAnswer = (questionId: number): ExamAnswer => ({
    questionId,
    type: 'text',
    value: text,
    characterCount: text.length,
  })

  const questionIds = displayNumbers.map(findQuestionId)
  const answers = questionIds.map(createAnswer)

  return _.zipObject(questionIds, answers)
}

const subsets = <T>(array: T[]): T[][] =>
  array.reduce((subsets, value) => subsets.concat(subsets.map((set) => [...set, value])), [[]] as T[][])
