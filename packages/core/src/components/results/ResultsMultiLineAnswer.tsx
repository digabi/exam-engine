import React, { useLayoutEffect, useRef } from 'react'
import { Score } from '../..'
import { useExamTranslation } from '../../i18n'
import { renderAnnotations } from '../../renderAnnotations'
import { ScreenReaderOnly } from '../ScreenReaderOnly'

export const ResultsMultiLineAnswer: React.FunctionComponent<{
  type: 'rich-text' | 'multi-line'
  value?: string
  score?: Score
}> = ({ type, score, value }) => {
  const { t } = useExamTranslation()
  const answerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (answerRef.current) {
      renderAnnotations(answerRef.current, score?.pregrading?.annotations ?? [], score?.censoring?.annotations ?? [])
    }
  })

  return (
    <div className="e-multiline-results-text-answer e-line-height-l e-pad-l-2 e-mrg-b-1">
      <ScreenReaderOnly>{t('screen-reader.answer-begin')}</ScreenReaderOnly>
      {type === 'rich-text' ? (
        <div dangerouslySetInnerHTML={{ __html: value || '' }} ref={answerRef} />
      ) : (
        <div className="e-pre-wrap" ref={answerRef}>
          {value}
        </div>
      )}
      <ScreenReaderOnly>{t('screen-reader.answer-end')}</ScreenReaderOnly>
    </div>
  )
}
