import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { getNumericAttribute, NBSP } from '../dom-utils'
import { playAudio } from '../store/audio/actions'
import { getAudioPlaybackError, getAudioState } from '../store/selectors'
import AudioPlaybackError from './AudioPlaybackError'
import { ExamComponentProps } from '../createRenderChildNodes'

function AudioTest({ element }: ExamComponentProps) {
  const src = element.getAttribute('src')!
  const duration = getNumericAttribute(element, 'duration')!
  const { t } = useTranslation()
  const audioState = useSelector(getAudioState(src))
  const audioPlaybackError = useSelector(getAudioPlaybackError(src))
  const dispatch = useDispatch()

  return (
    <div className="e-audio-test notification e-pad-2 e-mrg-b-4">
      <p>{t('audio-test.instructions')}</p>
      <div className="e-columns e-columns--center-v e-mrg-b-2">
        <div className="e-column e-column--narrow">
          <button
            className="e-button"
            disabled={audioState !== 'stopped'}
            onClick={() => audioState === 'stopped' && dispatch(playAudio({ src, duration }))}
          >
            <FontAwesomeIcon className="e-mrg-r-1" icon={faPlay} fixedWidth />
            {t('audio-test.play')}
          </button>
        </div>
        <div className="e-column">
          <AudioPlaybackError error={audioPlaybackError}>{NBSP}</AudioPlaybackError>
        </div>
      </div>
      <div>{t('audio-test.volume')}</div>
    </div>
  )
}

export default React.memo(AudioTest)
