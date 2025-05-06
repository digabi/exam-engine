import parseExam from '@digabi/exam-engine-core/dist/parser/parseExam'
import { listExams } from '@digabi/exam-engine-exams'
import { GetMediaMetadata, masterExam, MasteringResult } from '@digabi/exam-engine-mastering'
import { promises as fs } from 'fs'
import { keyBy } from 'lodash-es'
import { ExamAnswer, Score } from '../../src'
import { calculateQuestionsTotalSumScore, calculateQuestionSumScore } from '../../src/components/context/ResultsContext'
import { queryAll } from '../../src/dom-utils'

const allScores: Score[] = [
  {
    questionId: 330,
    answerId: 1,
    autograding: { score: 3 }
  },
  {
    questionId: 2,
    answerId: 2,
    pregrading: {
      score: 1
    },
    censoring: {
      scores: [
        { score: 4, shortCode: 'SE3' },
        { score: 3, shortCode: 'SE2' },
        { score: 2, shortCode: 'SE1' }
      ]
    },
    inspection: { score: 5, shortCodes: ['IN1', 'IN2'] }
  }
]

const answers: ExamAnswer[] = [
  {
    type: 'choice',
    questionId: 330,
    value: '93',
    displayNumber: '1.1'
  },
  {
    type: 'richText',
    questionId: 2,
    value: 'test',
    characterCount: 4,
    displayNumber: '1.2'
  }
]

const textAnswer: ExamAnswer[] = [
  {
    type: 'richText',
    questionId: 2,
    value: 'test',
    characterCount: 4
  }
]

const answersByQuestionId = keyBy(answers, 'questionId')

const testExam = 'SC.xml'
const language = 'fi-FI'

const getMediaMetadata: GetMediaMetadata = (__, type) =>
  Promise.resolve(type === 'audio' ? { duration: 999 } : { width: 999, height: 999 })

const exam = listExams().find(e => e.includes(testExam))
if (exam == null) {
  throw new Error(`Could not find the exam file to use in test: ${testExam}`)
}

let result: MasteringResult
let doc: XMLDocument
let topLevelQuestions: Element[]

describe(`Total score calculation for ${testExam}`, () => {
  beforeAll(async () => {
    const source = await fs.readFile(exam, 'utf-8')
    const results = await masterExam(source, () => '', getMediaMetadata)
    result = results.find(r => r.language === language) as MasteringResult
    doc = parseExam(result.xml, false)
    topLevelQuestions = queryAll(doc.documentElement, 'question', false)
  })

  it('calculate sum of all scores', () => {
    expect(
      calculateQuestionsTotalSumScore(topLevelQuestions, result.gradingStructure, allScores, answersByQuestionId)
    ).toBe(5)
  })

  it('get text answer score with pregrading only', () => {
    const textAnswerScorePregradingOnly: Score[] = [
      {
        questionId: 2,
        answerId: 2,
        pregrading: {
          score: 1
        }
      }
    ]
    expect(
      calculateQuestionSumScore(
        topLevelQuestions[0],
        result.gradingStructure,
        textAnswerScorePregradingOnly,
        keyBy(textAnswer, 'questionId')
      )
    ).toBe(1)
  })

  it('get text answer score with one censoring score', () => {
    const textAnswerScoreOneCensor: Score[] = [
      {
        questionId: 2,
        answerId: 2,
        pregrading: {
          score: 1
        },
        censoring: {
          scores: [{ score: 2, shortCode: 'SE1' }]
        }
      }
    ]
    expect(
      calculateQuestionSumScore(
        topLevelQuestions[0],
        result.gradingStructure,
        textAnswerScoreOneCensor,
        keyBy(textAnswer, 'questionId')
      )
    ).toBe(2)
  })

  it('get text answer score with two censoring scores', () => {
    const textAnswerScoreTwoCensors: Score[] = [
      {
        questionId: 2,
        answerId: 2,
        pregrading: {
          score: 1
        },
        censoring: {
          scores: [
            { score: 3, shortCode: 'SE2' },
            { score: 2, shortCode: 'SE1' }
          ]
        }
      }
    ]
    expect(
      calculateQuestionSumScore(
        topLevelQuestions[0],
        result.gradingStructure,
        textAnswerScoreTwoCensors,
        keyBy(textAnswer, 'questionId')
      )
    ).toBe(3)
  })

  it('get text answer score with inspection score', () => {
    const textAnswerScoreInspection: Score[] = [
      {
        questionId: 2,
        answerId: 2,
        pregrading: {
          score: 1
        },
        censoring: {
          scores: [
            { score: 2, shortCode: 'SE1' },
            { score: 3, shortCode: 'SE2' }
          ]
        },
        inspection: { score: 7, shortCodes: ['IN1', 'IN2'] }
      }
    ]
    expect(
      calculateQuestionSumScore(
        topLevelQuestions[0],
        result.gradingStructure,
        textAnswerScoreInspection,
        keyBy(textAnswer, 'questionId')
      )
    ).toBe(7)
  })

  it('get choice answer score', () => {
    const choiceAnswer: ExamAnswer = {
      type: 'choice',
      questionId: 1,
      value: '106',
      displayNumber: '1.1'
    }
    expect(
      calculateQuestionSumScore(topLevelQuestions[0], result.gradingStructure, [], keyBy([choiceAnswer], 'questionId'))
    ).toBe(3)
  })

  it('get scored text answer score', () => {
    const scoredTextAnswer: ExamAnswer[] = [
      {
        type: 'text',
        questionId: 83,
        value: 'Willst du am Samstag mit ins Kino kommen',
        characterCount: 33,
        displayNumber: '18.1'
      },
      {
        type: 'text',
        questionId: 84,
        value: 'Bar Bar',
        characterCount: 6,
        displayNumber: '18.2'
      }
    ]

    const scoredTextScore: Score[] = [
      {
        questionId: 83,
        answerId: 83,
        autograding: { score: 2 }
      },
      {
        questionId: 84,
        answerId: 84,
        autograding: { score: 0 }
      }
    ]

    expect(
      calculateQuestionSumScore(
        topLevelQuestions[17],
        result.gradingStructure,
        scoredTextScore,
        keyBy(scoredTextAnswer, 'questionId')
      )
    ).toBe(2)
  })
})
