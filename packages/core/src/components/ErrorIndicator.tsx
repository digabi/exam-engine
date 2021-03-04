import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { findChildElement } from '../dom-utils'
import { useExamTranslation } from '../i18n'
import { AppState } from '../store'
import { ExtraAnswer } from '../validateAnswers'
import AnsweringInstructions from './AnsweringInstructions'
import { CommonExamContext } from './CommonExamContext'

const ErrorIndicator: React.FunctionComponent = () => {
  const extraAnswers = useSelector((state: AppState) => state.answers.extraAnswers)
  const { t } = useExamTranslation()

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
              {type !== 'exam' && type !== 'toc-section'
                ? t(type, { displayNumber }) || <FallbackTitle {...extraAnswer} />
                : ''}{' '}
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
