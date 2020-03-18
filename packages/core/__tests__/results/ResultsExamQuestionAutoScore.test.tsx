import * as i18next from 'i18next'
import React from 'react'
import { I18nextProvider } from 'react-i18next'
import { create } from 'react-test-renderer'
import { QuestionContext } from '../../src/components/QuestionContext'
import ResultsExamQuestionAutoScore, {
  ResultsExamQuestionAutoScoreProps
} from '../../src/components/results/ResultsExamQuestionAutoScore'
import { initI18n } from '../../src/i18n'

describe('<ResultsExamQuestionAutoScore />', () => {
  let i18n: i18next.i18n

  beforeAll(() => {
    i18n = initI18n('fi-FI', null, null)
  })

  it('renders without score', () => {
    const props = {
      score: undefined,
      maxScore: 3,
      displayNumber: '1'
    }
    expect(renderWithContext(props, []).toJSON()).toMatchSnapshot()
  })

  it('renders with score', () => {
    const props = {
      score: 1,
      maxScore: 3,
      displayNumber: '1'
    }
    expect(renderWithContext(props, []).toJSON()).toMatchSnapshot()
  })

  it('renders displayNumber number when there are more than one answer', () => {
    const props = {
      score: 1,
      maxScore: 3,
      displayNumber: '1'
    }
    expect(renderWithContext(props, [{} as Element, {} as Element]).toJSON()).toMatchSnapshot()
  })

  const contextProps = {
    answers: [],
    displayNumber: '1',
    hasExternalMaterial: false,
    maxAnswers: 2,
    maxScore: 2,
    level: 2,
    childQuestions: []
  }

  function renderWithContext(props: ResultsExamQuestionAutoScoreProps, answers: Element[]) {
    return create(
      <QuestionContext.Provider value={{ ...contextProps, answers }}>
        <I18nextProvider i18n={i18n}>
          <ResultsExamQuestionAutoScore {...props} />
        </I18nextProvider>
      </QuestionContext.Provider>
    )
  }
})
