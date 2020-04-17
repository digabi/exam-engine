import React from 'react'
import { Translation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { getGlobalSaveState } from '../store/selectors'
import { SaveState } from '../types'

function SaveIndicator() {
  const state: SaveState = useSelector(getGlobalSaveState())

  if (state === 'initial') {
    return null
  }

  return (
    <div className="save-indicator">
      <span className={'save-indicator-text--' + state}>
        <Translation>{(t) => t('answer-saved')}</Translation>
      </span>
    </div>
  )
}

export default React.memo(SaveIndicator)
