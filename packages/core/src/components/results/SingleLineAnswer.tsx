import React, { useLayoutEffect, useRef } from 'react'
import { Score } from '../..'
import { useExamTranslation } from '../../i18n'
import { renderAnnotations } from '../../renderAnnotations'
import { ScreenReaderOnly } from '../ScreenReaderOnly'
import { useIsFinishExamPage } from './isExamFinishPageHook'
import classNames from 'classnames'

function SingleLineAnswer({
  displayNumber,
  score,
  value,
  children
}: {
  answers: Element[]
  score?: Score
  displayNumber?: string
  value: string | undefined
  children: React.ReactNode
}) {
  const { t } = useExamTranslation()
  const answerRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (answerRef.current) {
      renderAnnotations(answerRef.current, score?.pregrading?.annotations ?? [], score?.censoring?.annotations ?? [])
    }
  })

  const isFinishExamPage = useIsFinishExamPage()

  return (
    <>
      {displayNumber && <sup>{displayNumber}</sup>}
      <span
        className={classNames('text-answer text-answer--single-line', {
          noAnswer: isFinishExamPage && value === undefined
        })}
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
