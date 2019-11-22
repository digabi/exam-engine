import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import ReactCSSTransitionReplace from 'react-css-transition-replace'
import { useTranslation } from 'react-i18next'
import { AudioPlaybackError } from './types'

export default function AudioPlaybackError({
  error,
  children
}: {
  error?: AudioPlaybackError
  children?: React.ReactNode
}) {
  const { t } = useTranslation()

  return (
    <ReactCSSTransitionReplace transitionName="e-crossfade" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
      {error != null ? (
        <div className="e-color-error">
          <FontAwesomeIcon icon={faExclamationTriangle} className="e-mrg-r-1" />
          {t(`audio-errors.${error}`)}
        </div>
      ) : (
        <div key="no-error">{children}</div>
      )}
    </ReactCSSTransitionReplace>
  )
}
