import React, { useMemo } from 'react'
import { I18nextProvider } from 'react-i18next'
import { MultiLineAnswer } from '../../../../src/components/results/MultiLineAnswer'
import { initI18n } from '../../../../src/i18n'
import { Score } from '../../../../src'
import '../../../../src/css/main.less'
import logoImage from '../../../../img/logo.png'

const answerWithImage = (imageWidth: number) => `Hello<img src="${logoImage}" width="${imageWidth}" />World`

export const MultiLineAnswerStory: React.FC<{ imageWidth: number; score?: Score }> = ({ imageWidth, score }) => {
  const i18n = useMemo(() => initI18n('fi-FI'), [])
  return (
    <I18nextProvider i18n={i18n}>
      <div className="e-results">
        <MultiLineAnswer type="rich-text" value={answerWithImage(imageWidth)} score={score} />
      </div>
    </I18nextProvider>
  )
}
