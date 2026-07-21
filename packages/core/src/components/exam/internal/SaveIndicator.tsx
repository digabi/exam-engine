import classNames from 'classnames'
import React from 'react'
import { useSelector } from 'react-redux'
import { SaveState } from '../../../index'
import { useExamTranslation } from '../../../i18n'
import { getAnyAnswerTooLongFailure, getSaveState } from '../../../store/selectors'

function SaveIndicator() {
  const state: SaveState = useSelector(getSaveState)
  const tooLongFailureDisplayNumber = useSelector(getAnyAnswerTooLongFailure)
  const { t } = useExamTranslation()

  if (state === 'initial' && !tooLongFailureDisplayNumber) {
    return null
  }

  return (
    <dialog open className="save-indicator e-pad-1 e-font-size-xs">
      {tooLongFailureDisplayNumber ? (
        <span className="save-indicator-text" role="alert">
          {t('answer-errors.save-failed-too-long', { displayNumber: tooLongFailureDisplayNumber })}
        </span>
      ) : (
        <span className={classNames('save-indicator-text', `save-indicator-text--${state}`)}>{t('answer-saved')}</span>
      )}
    </dialog>
  )
}

export default React.memo(SaveIndicator)
