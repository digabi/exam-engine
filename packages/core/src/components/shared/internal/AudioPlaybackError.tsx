import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import ReactCSSTransitionReplace from 'react-css-transition-replace'
import { AudioPlaybackError } from '../../../index'
import { useExamTranslation } from '../../../i18n'

const AudioPlaybackError: React.FunctionComponent<{
  error?: AudioPlaybackError
}> = ({ error, children }) => {
  const { t } = useExamTranslation()

  return (
    <ReactCSSTransitionReplace transitionName="e-crossfade" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
      {error != null ? (
        <div className="e-color-error" role="alert">
          <FontAwesomeIcon icon={faExclamationTriangle} className="e-mrg-r-1" />
          {t(`audio-errors.${error}` as const)}
        </div>
      ) : (
        <div key="no-error">{children}</div>
      )}
    </ReactCSSTransitionReplace>
  )
}

export default AudioPlaybackError
