import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { AppState } from '../store'
import AnsweringInstructions from './AnsweringInstructions'
import { ExtraAnswer } from '../validateAnswers'
import { CommonExamContext } from './CommonExamContext'
import { findChildElement } from '../dom-utils'

const ErrorIndicator: React.FunctionComponent = () => {
  const extraAnswers = useSelector((state: AppState) => state.answers.extraAnswers)
  const { t } = useTranslation()

  return extraAnswers.length > 0 ? (
    <div
      className="error-indicator e-columns e-columns--inline e-bg-color-error e-color-off-white e-font-size-xs e-pad-1 e-mrg-r-1"
      role="alert"
    >
      <div className="e-column e-column--narrow">
        <FontAwesomeIcon size="lg" icon={faExclamationTriangle} fixedWidth className="e-mrg-r-1" />
      </div>
      <div className="e-column e-column--gapless">
        {extraAnswers.map((extraAnswer) => {
          const { displayNumber, type } = extraAnswer
          return (
            <div key={type + displayNumber}>
              {type !== 'exam' ? t(extraAnswer.type, { displayNumber }) || <FallbackTitle {...extraAnswer} /> : ''}{' '}
              {<AnsweringInstructions {...extraAnswer} />}
            </div>
          )
        })}
      </div>
    </div>
  ) : null
}

const FallbackTitle: React.FunctionComponent<ExtraAnswer> = ({ type, displayNumber }) => {
  // Hack. M/N exams have set the section translation title to an empty string,
  // so they can hide the "Osa 1:" text within the exam. In these cases, display
  // the text content of the corresponding <e:section-title> instead. Hopefully
  // we can delete this code on some day. 💩
  if (type === 'section') {
    const { root } = useContext(CommonExamContext)
    const section = findChildElement(
      root,
      (e) => e.localName === 'section' && e.getAttribute('display-number') === displayNumber
    )
    if (section) {
      const sectionTitle = findChildElement(section, 'section-title')
      if (sectionTitle) {
        return <>{sectionTitle.textContent!.trim() + ':'}</>
      }
    }
  }
  return null
}

export default React.memo(ErrorIndicator)
