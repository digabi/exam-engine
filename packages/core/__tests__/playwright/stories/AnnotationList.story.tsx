import React from 'react'
import { QuestionContext } from '../../../src/components/context/QuestionContext'
import { ResultsContext } from '../../../src/components/context/ResultsContext'
import { I18nextProvider } from 'react-i18next'
import AnnotationList from '../../../src/components/results/internal/AnnotationList'
import { useCached } from '../../../src/useCached'
import { initI18n } from '../../../src/i18n'

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

interface AnnotationListStoryProps {
  results: Partial<ResultsContext>
  lang?: string
}

export const AnnotationListStory: React.FC<AnnotationListStoryProps> = ({ results, lang }) => {
  const i18n = useCached(() => initI18n(lang || 'fi-FI'))

  return (
    <QuestionContext.Provider
      value={{
        ...questionContextProps,
        answers: [mkTextAnswer()]
      }}
    >
      <ResultsContext.Provider value={{ ...resultsContextDefaults, ...results }}>
        <I18nextProvider i18n={i18n}>
          <AnnotationList />
        </I18nextProvider>
      </ResultsContext.Provider>
    </QuestionContext.Provider>
  )
}

function mkTextAnswer() {
  const textAnswer = document.createElement('text-answer')
  textAnswer.setAttribute('type', 'rich-text')
  textAnswer.setAttribute('max-score', '10')
  textAnswer.setAttribute('question-number', '5.1')
  textAnswer.setAttribute('question-id', '1')
  return textAnswer
}
