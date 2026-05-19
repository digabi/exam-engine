import React, { useMemo, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { MultiLineAnswer } from '../../../../src/components/results/MultiLineAnswer'
import { initI18n } from '../../../../src/i18n'
import { Score } from '../../../../src'
import '../../../../src/css/main.less'

export const imageSrc = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><rect width="200" height="100" fill="green"/></svg>'
)}`

const answerWithImage = `Hello<img src="${imageSrc}" />World`

export const MultiLineAnswerStory: React.FC<{ width: number }> = ({ width }) => {
  const i18n = useMemo(() => initI18n('fi-FI'), [])
  return (
    <I18nextProvider i18n={i18n}>
      <div className="e-results" style={{ width }}>
        <MultiLineAnswer type="rich-text" value={answerWithImage} />
      </div>
    </I18nextProvider>
  )
}

export const MultiLineAnswerDelayedScoreStory: React.FC = () => {
  const i18n = useMemo(() => initI18n('fi-FI'), [])
  const [score, setScore] = useState<Score | undefined>()

  return (
    <I18nextProvider i18n={i18n}>
      <div className="e-results" style={{ width: 80 }}>
        <button type="button" onClick={() => setScore(textAnnotationScore)}>
          Add score
        </button>
        <MultiLineAnswer type="rich-text" value={answerWithImage} score={score} />
      </div>
    </I18nextProvider>
  )
}

const textAnnotationScore: Score = {
  questionId: 1,
  answerId: 1,
  pregrading: {
    score: 1,
    annotations: [{ type: 'text', startIndex: 6, length: 5, message: 'Text annotation' }]
  }
}
