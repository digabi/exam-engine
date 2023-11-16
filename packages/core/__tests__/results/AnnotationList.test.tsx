import * as i18next from 'i18next'
import _ from 'lodash'
import React from 'react'
import { I18nextProvider } from 'react-i18next'
import { create } from 'react-test-renderer'
import { Score } from '../../src'
import { QuestionContext } from '../../src/components/context/QuestionContext'
import AnnotationList from '../../src/components/results/internal/AnnotationList'
import { ResultsContext } from '../../src/components/context/ResultsContext'
import { initI18n } from '../../src/i18n'

function mkTextAnswer(questionId: number, displayNumber: string, maxScore: number): Element {
  const textAnswer = document.createElement('text-answer')
  textAnswer.setAttribute('type', 'rich-text')
  textAnswer.setAttribute('max-score', String(maxScore))
  textAnswer.setAttribute('question-number', displayNumber)
  textAnswer.setAttribute('question-id', String(questionId))

  return textAnswer
}

const defaultScores: Score = {
  questionId: 1,
  answerId: 1,
  pregrading: {
    score: 1,
    annotations: [
      {
        startIndex: 0,
        length: 1,
        message: 'Test pregrading annotation'
      }
    ]
  },
  censoring: {
    scores: [
      { score: 4, shortCode: 'SE3' },
      { score: 3, shortCode: 'SE2' },
      { score: 2, shortCode: 'SE1' }
    ],
    annotations: [
      {
        startIndex: 0,
        length: 1,
        message: 'Test censoring annotation'
      }
    ]
  },
  inspection: { score: 5, shortCodes: ['IN1', 'IN2'] }
}

const defaultAnswer = mkTextAnswer(1, '5.1', 12)

describe('<AnnotationList />', () => {
  let i18n: i18next.i18n

  describe('fi-FI', () => {
    beforeAll(() => {
      i18n = initI18n('fi-FI')
    })

    it('renders empty without score', () => {
      const resultsProps = {
        scores: []
      }
      expect(renderWithContext(resultsProps, [defaultAnswer]).toJSON()).toMatchSnapshot()
    })

    it('renders empty without annotations', () => {
      const resultsProps = {
        scores: [_.pick(defaultScores, 'answerId', 'questionId')]
      }
      expect(renderWithContext(resultsProps, [defaultAnswer]).toJSON()).toMatchSnapshot()
    })

    it('renders with only pregrading annotations', () => {
      const resultsProps = {
        scores: [_.pick(defaultScores, 'pregrading', 'answerId', 'questionId')]
      }
      expect(renderWithContext(resultsProps, [defaultAnswer]).toJSON()).toMatchSnapshot()
    })

    it('filters empty annotations', () => {
      const resultsProps = {
        scores: [
          {
            ..._.pick(defaultScores, 'pregrading', 'answerId', 'questionId'),
            ...{
              pregrading: {
                score: 1,
                annotations: [
                  {
                    startIndex: 0,
                    length: 1,
                    message: 'Before empty annotation'
                  },
                  {
                    startIndex: 1,
                    length: 1,
                    message: ''
                  },
                  {
                    startIndex: 2,
                    length: 1,
                    message: 'After empty annotation'
                  }
                ]
              }
            }
          }
        ]
      }
      expect(renderWithContext(resultsProps, [defaultAnswer]).toJSON()).toMatchSnapshot()
    })

    it('renders with only censoring annotations', () => {
      const resultsProps = {
        scores: [_.pick(defaultScores, 'censoring', 'answerId', 'questionId')]
      }
      expect(renderWithContext(resultsProps, [defaultAnswer]).toJSON()).toMatchSnapshot()
    })

    it('renders with pregrading and censoring annotations', () => {
      const resultsProps = {
        scores: [defaultScores]
      }
      expect(renderWithContext(resultsProps, [defaultAnswer]).toJSON()).toMatchSnapshot()
    })

    it('renders only pregrading without header on singleGrading in ResultContext', () => {
      const resultsProps = {
        scores: [defaultScores],
        singleGrading: true
      }
      expect(renderWithContext(resultsProps, [defaultAnswer]).toJSON()).toMatchSnapshot()
    })

    it('renders null if no scores and singleGrading in ResultContext', () => {
      const resultsProps = {
        scores: [],
        singleGrading: true
      }
      expect(renderWithContext(resultsProps, [defaultAnswer]).toJSON()).toMatchSnapshot()
    })
  })

  describe('sv-FI', () => {
    it('renders with pregrading and censoring annotations', () => {
      i18n = initI18n('sv-FI')
      const resultsProps = {
        scores: [defaultScores]
      }
      expect(renderWithContext(resultsProps, [defaultAnswer]).toJSON()).toMatchSnapshot()
    })
  })

  const questionContextProps: QuestionContext = {
    answers: [],
    displayNumber: '1',
    hasExternalMaterial: false,
    maxAnswers: 2,
    maxScore: 2,
    level: 2,
    childQuestions: [],
    questionLabelIds: ''
  }

  const resultsContextDefaults: ResultsContext = {
    answersByQuestionId: {},
    gradingStructure: { questions: [] },
    scores: [],
    gradingText: '',
    totalScore: 60
  }

  function renderWithContext(results: Partial<ResultsContext>, answers: Element[]) {
    return create(
      <QuestionContext.Provider value={{ ...questionContextProps, ...{ answers } }}>
        <ResultsContext.Provider value={{ ...resultsContextDefaults, ...results }}>
          <I18nextProvider i18n={i18n}>
            <AnnotationList />
          </I18nextProvider>
        </ResultsContext.Provider>
      </QuestionContext.Provider>
    )
  }
})
