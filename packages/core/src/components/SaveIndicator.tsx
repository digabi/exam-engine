import React from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { getSaveState } from '../store/selectors'
import { SaveState } from '..'

function SaveIndicator() {
  const state: SaveState = useSelector(getSaveState)
  const { t } = useTranslation()

  if (state === 'initial') {
    return null
  }

  return (
    <div className="save-indicator e-pad-1 e-font-size-xs">
      <span className={classNames('save-indicator-text', 'save-indicator-text--' + state)}>{t('answer-saved')}</span>
    </div>
  )
}

export default React.memo(SaveIndicator)
