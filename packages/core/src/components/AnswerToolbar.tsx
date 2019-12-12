import React from 'react'
import { Translation } from 'react-i18next'
import { closest, findChildElement, NBSP } from '../dom-utils'
import * as actions from '../store/answers/actions'
import { AnswerError, ExamAnswer } from './types'

interface AnswerToolbarProps {
  answer?: ExamAnswer
  error?: AnswerError | null
  element: Element
  isSaved: boolean
  selectAnswerVersion?: typeof actions.selectAnswerVersion
  showAnswerHistory?: boolean
  supportsAnswerHistory?: boolean
}

function AnswerToolbar({
  answer,
  element,
  error,
  isSaved,
  selectAnswerVersion,
  showAnswerHistory = false,
  supportsAnswerHistory = false
}: AnswerToolbarProps) {
  return (
    <div className="answer-toolbar e-font-size-xs e-color-darkgrey e-columns e-mrg-b-2">
      <div className="answer-toolbar__answer-length e-column e-column--auto">
        {answer && (answer.type === 'text' || answer.type === 'richText') ? (
          <Translation>{t => t('answer-length', { count: answer.characterCount })}</Translation>
        ) : (
          NBSP
        )}
      </div>
      <div className="answer-toolbar__errors e-column e-column--narrow">
        {error && <Translation>{t => t(`answer-errors.${error.key}`, error.options)}</Translation>}
      </div>
      <div className="answer-toolbar__history e-column e-column--auto e-text-right">
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
                    const question = closest(element, 'question')!
                    const questionTitle = findChildElement(question, 'question-title')!
                    selectAnswerVersion(answer.questionId, questionTitle.textContent!)
                  }
                }}
              >
                <Translation>{t => t('previous-answer-versions')}</Translation>
              </button>
            ) : (
              NBSP
            )}
          </div>
        )}
        <div className="answer-toolbar__saved">
          {isSaved ? <Translation>{t => t('answer-saved')}</Translation> : NBSP}
        </div>
      </div>
    </div>
  )
}

export default React.memo(AnswerToolbar)
