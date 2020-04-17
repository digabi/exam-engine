import classNames from 'classnames'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { getNumericAttribute } from '../dom-utils'
import { getAudioPlaybackError, getPlaybackTimesRemaining } from '../store/selectors'
import AudioPlaybackError from './AudioPlaybackError'
import { CommonExamContext } from './CommonExamContext'
import RestrictedAudioPlayer from './RestrictedAudioPlayer'
import { ExamComponentProps } from '../createRenderChildNodes'

function Audio({ element, className, renderChildNodes }: ExamComponentProps) {
  const src = element.getAttribute('src')!
  const restrictedAudioId = getNumericAttribute(element, 'restricted-audio-id')
  const times = getNumericAttribute(element, 'times')
  const duration = getNumericAttribute(element, 'duration')!
  const { t } = useTranslation()
  const audioPlaybackError =
    times != null && restrictedAudioId != null ? useSelector(getAudioPlaybackError(src, restrictedAudioId)) : undefined
  const playbackTimesRemaining =
    times != null && restrictedAudioId != null
      ? useSelector(getPlaybackTimesRemaining(restrictedAudioId, times))
      : undefined
  const { resolveAttachment } = useContext(CommonExamContext)

  return (
    <div className={classNames('audio e-columns e-columns--center-v e-mrg-b-2', className)}>
      {restrictedAudioId != null && times != null ? (
        <RestrictedAudioPlayer {...{ src, restrictedAudioId, duration, times }} />
      ) : (
        <audio className="e-column e-column--narrow" preload="metadata" controls>
          <source src={resolveAttachment(src)} />
        </audio>
      )}
      <div className="e-column">
        <AudioPlaybackError error={audioPlaybackError}>
          {element.hasChildNodes() && renderChildNodes(element)}
        </AudioPlaybackError>
        {playbackTimesRemaining != null && <em>{t('listen-times-remaining', { count: playbackTimesRemaining })}</em>}
      </div>
    </div>
  )
}

export default React.memo(Audio)
