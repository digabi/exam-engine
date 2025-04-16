import classNames from 'classnames'
import React from 'react'
import { useSelector } from 'react-redux'
import { SaveState } from '../../../index'
import { useExamTranslation } from '../../../i18n'
import { getSaveState } from '../../../store/selectors'

function SaveIndicator() {
  const state: SaveState = useSelector(getSaveState)
  const { t } = useExamTranslation()

  if (state === 'initial') {
    return null
  }

  return (
    <dialog open className="save-indicator e-pad-1 e-font-size-xs">
      <span className={classNames('save-indicator-text', `save-indicator-text--${state}`)}>{t('answer-saved')}</span>
    </dialog>
  )
}

export default React.memo(SaveIndicator)
