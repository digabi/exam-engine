import React from 'react'
import classNames from 'classnames'
import { TextAnswer, RichTextAnswer } from '..'
import { findChildElement, getNumericAttribute, NBSP, queryAncestors } from '../dom-utils'
import { useExamTranslation } from '../i18n'
import * as actions from '../store/answers/actions'
import { AnswerTooLong } from '../validateAnswers'
import { ScreenshotError } from './exam/RichTextAnswer'

interface AnswerToolbarProps {
  answer?: TextAnswer | RichTextAnswer
  screenshotError?: ScreenshotError
  validationError?: AnswerTooLong
  element: Element
  selectAnswerVersion?: typeof actions.selectAnswerVersion
  showAnswerHistory?: boolean
  supportsAnswerHistory?: boolean
}

function AnswerToolbar({
  answer,
  element,
  screenshotError,
  validationError,
  selectAnswerVersion,
  showAnswerHistory = false,
  supportsAnswerHistory = false
}: AnswerToolbarProps) {
  const { t } = useExamTranslation()
  const answerLength = answer?.characterCount
  const maxLength = getNumericAttribute(element, 'max-length')
  return (
    <div className="answer-toolbar e-font-size-xs e-columns e-mrg-b-2">
      <div
        className={classNames('answer-toolbar__answer-length e-column', { 'e-color-error': validationError != null })}
      >
        {answer != null
          ? t(maxLength != null ? 'answer-length-with-max-length' : 'answer-length', {
              count: answerLength,
              maxLength: maxLength
            })
          : NBSP}
        {screenshotError ? (
          <span className="e-color-error" role="alert">
            {' '}
            {t(`answer-errors.${screenshotError.key}` as const, screenshotError.options)}
          </span>
        ) : validationError ? (
          // We don't use an alert role here because ErrorIndicator already displays the same error message wrapped in an alert role
          <span> {t(`answer-errors.answer-too-long`, { count: validationError.characterCount })}</span>
        ) : null}
      </div>
      <div className="answer-toolbar__history e-column e-column--narrow e-text-right">
        {supportsAnswerHistory && (
          <div className="answer-toolbar__select-previous-version">
            {showAnswerHistory && answer != null ? (
              <button
                className="answer-toolbar__previous-versions e-link-button e-font-size-xs"
                onClick={() => {
                  // This is kind of hacky. We need to render the question title in the answer history modal,
                  // but the current element we're at is text-answer. So we have to find the containing question
                  // and its question-title element (which is specified to be the first child element of the question).
                  if (selectAnswerVersion) {
                    const question = queryAncestors(element, 'question')!
                    const questionTitle = findChildElement(question, 'question-title')!
                    selectAnswerVersion(answer.questionId, questionTitle.textContent)
                  }
                }}
              >
                {t('previous-answer-versions')}
              </button>
            ) : (
              NBSP
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(AnswerToolbar)
