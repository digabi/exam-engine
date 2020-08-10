import React from 'react'
import { getAnnotationAttributes } from './helpers'
import { Score } from '../..'
import { useTranslation } from 'react-i18next'

function ResultsSingleLineAnswer({
  answers,
  displayNumber,
  answerScores,
  value,
  children,
}: {
  answers: Element[]
  answerScores?: Score
  displayNumber: string
  value: string | undefined
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  return (
    <>
      {answers.length > 1 && <sup>{displayNumber}</sup>}
      <span className="answer text-answer text-answer--single-line">
        <span className="e-inline-block answer-text-container">
          <span className="e-screen-reader-only">{t('screen-reader.answer-begin')}</span>
          <div className="answerText e-inline-block" {...getAnnotationAttributes(answerScores)}>
            {value}
          </div>
          <span className="e-screen-reader-only">{t('screen-reader.answer-end')}</span>
        </span>
      </span>
      {children}
    </>
  )
}

export default React.memo(ResultsSingleLineAnswer)
