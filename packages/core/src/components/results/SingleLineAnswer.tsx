import classNames from 'classnames'
import React, { useLayoutEffect, useRef } from 'react'
import { Score } from '../..'
import { useExamTranslation } from '../../i18n'
import { renderAnnotations } from '../../renderAnnotations'
import { ScreenReaderOnly } from '../ScreenReaderOnly'

function SingleLineAnswer({
  displayNumber,
  score,
  value,
  answers,
  children
}: {
  answers: Element[]
  score?: Score
  displayNumber?: string
  value: string | undefined
  children: React.ReactNode
}) {
  const { t, i18n } = useExamTranslation()
  const answerRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (answerRef.current) {
      renderAnnotations(answerRef.current, score?.pregrading?.annotations ?? [], score?.censoring?.annotations ?? [])
    }
  })

  return (
    <>
      {displayNumber && answers.length > 1 && <sup>{displayNumber}</sup>}
      <span
        className={classNames('text-answer text-answer--single-line', {
          'no-answer': !value
        })}
        aria-description={!value ? i18n.t('examineExam.questionHasNoAnswer') : undefined}
      >
        <ScreenReaderOnly>{t('screen-reader.answer-begin')}</ScreenReaderOnly>
        <span className="e-inline-block" ref={answerRef}>
          {value}
        </span>
        <ScreenReaderOnly>{t('screen-reader.answer-end')}</ScreenReaderOnly>
      </span>
      {children}
    </>
  )
}

export default React.memo(SingleLineAnswer)
