import React from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { AppState } from '../store'
import AnsweringInstructions from './AnsweringInstructions'

const ErrorIndicator: React.FunctionComponent = () => {
  const extraAnswers = useSelector((state: AppState) => state.answers.extraAnswers)
  const { t } = useTranslation()

  return extraAnswers.length > 0 ? (
    <div
      className="error-indicator e-columns e-columns--inline e-bg-color-error e-color-off-white e-font-size-xs e-pad-1 e-mrg-r-1"
      role="alert"
      key="visible"
    >
      <div className="e-column e-column--narrow">
        <FontAwesomeIcon size="lg" icon={faExclamationTriangle} fixedWidth className="e-mrg-r-1" />
      </div>
      <div className="e-column e-column--gapless">
        {extraAnswers.map((extraAnswer) => (
          <div key={extraAnswer.type + extraAnswer.displayNumber}>
            {extraAnswer.type !== 'exam' ? t(extraAnswer.type, { displayNumber: extraAnswer.displayNumber }) : ''}{' '}
            {<AnsweringInstructions {...extraAnswer} />}
          </div>
        ))}
      </div>
    </div>
  ) : null
}

export default React.memo(ErrorIndicator)
