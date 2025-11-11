import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import ReactCSSTransitionReplace from 'react-css-transition-replace'
import { AudioError } from '../../../index'
import { useExamTranslation } from '../../../i18n'

const RenderIfNoError: React.FunctionComponent<{
  error?: AudioError
  children: React.ReactNode[] | React.ReactNode
}> = ({ error, children }) => {
  const { t } = useExamTranslation()

  return (
    // @types/react 18 removed children from implicit props. This component has not explicitly added them yet
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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

export default RenderIfNoError
