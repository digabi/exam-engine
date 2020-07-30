import React from 'react'
import { useTranslation } from 'react-i18next'
import { findChildElement, NBSP, queryAncestors } from '../dom-utils'
import * as actions from '../store/answers/actions'
import { AnswerError } from './RichTextAnswer'
import { ExamAnswer } from '..'

interface AnswerToolbarProps {
  answer?: ExamAnswer
  error?: AnswerError | null
  element: Element
  selectAnswerVersion?: typeof actions.selectAnswerVersion
  showAnswerHistory?: boolean
  supportsAnswerHistory?: boolean
}

function AnswerToolbar({
  answer,
  element,
  error,
  selectAnswerVersion,
  showAnswerHistory = false,
  supportsAnswerHistory = false,
}: AnswerToolbarProps) {
  const { t } = useTranslation()

  return (
    <div className="answer-toolbar e-font-size-xs e-color-darkgrey e-columns e-mrg-b-2">
      <div className="answer-toolbar__answer-length e-column e-column--narrow">
        {answer && (answer.type === 'text' || answer.type === 'richText')
          ? t('answer-length', { count: answer.characterCount })
          : NBSP}
      </div>
      <div className="answer-toolbar__errors e-column e-column--auto e-text-center">
        {error && <span role="alert">{t(`answer-errors.${error.key}`, error.options)}</span>}
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
                    selectAnswerVersion(answer.questionId, questionTitle.textContent!)
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
