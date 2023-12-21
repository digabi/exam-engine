import React, { useLayoutEffect, useRef } from 'react'
import { Score } from '../..'
import { useExamTranslation } from '../../i18n'
import { renderAnnotations } from '../../renderAnnotations'
import { ScreenReaderOnly } from '../ScreenReaderOnly'
import classNames from 'classnames'

export const MultiLineAnswer: React.FunctionComponent<{
  type: 'rich-text'
  value?: string
  score?: Score
}> = ({ type, score, value }) => {
  const { t, i18n } = useExamTranslation()
  const answerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (answerRef.current) {
      renderAnnotations(answerRef.current, score?.pregrading?.annotations ?? [], score?.censoring?.annotations ?? [])
    }
  })

  return (
    <div
      className={classNames('e-multiline-results-text-answer e-line-height-l e-pad-x-2 e-mrg-b-1', {
        'no-answer': !value
      })}
      aria-description={!value ? i18n.t('examineExam.questionHasNoAnswer') : undefined}
    >
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
