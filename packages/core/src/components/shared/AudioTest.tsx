import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute, NBSP } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { playAudio } from '../../store/audio/actions'
import { getAudioPlaybackError, getAudioState } from '../../store/selectors'
import AudioPlaybackError from './internal/AudioPlaybackError'
import { CommonExamContext } from '../context/CommonExamContext'

function AudioTest({ element }: ExamComponentProps) {
  const src = element.getAttribute('src')!
  const duration = getNumericAttribute(element, 'duration')!
  const { t } = useExamTranslation()
  const audioState = useSelector(getAudioState(src))
  const audioPlaybackError = useSelector(getAudioPlaybackError(src))
  const dispatch = useDispatch()
  const { abitti2, resolveAttachment } = useContext(CommonExamContext)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  return (
    <div className="e-audio-test notification e-pad-2 e-mrg-b-4">
      <p>{t('audio-test.instructions')}</p>
      <div className="e-columns e-columns--center-v e-mrg-b-2">
        <div className="e-column e-column--narrow">
          {abitti2 && (
            <audio ref={audioRef} preload="none">
              <source src={resolveAttachment(src)} />
            </audio>
          )}
          <button
            className="e-button"
            disabled={audioState !== 'stopped'}
            onClick={() => audioState === 'stopped' && dispatch(playAudio({ src, duration, audioRef }))}
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
