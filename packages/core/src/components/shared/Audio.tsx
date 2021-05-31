import classNames from 'classnames'
import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute } from '../../dom-utils'
import { useExamTranslation } from '../../i18n'
import { audioLabelId } from '../../ids'
import { getAudioPlaybackError, getPlaybackTimesRemaining } from '../../store/selectors'
import AudioPlaybackError from './internal/AudioPlaybackError'
import { CommonExamContext } from '../context/CommonExamContext'
import RestrictedAudioPlayer from './internal/RestrictedAudioPlayer'

function Audio({ element, className, renderChildNodes }: ExamComponentProps) {
  const src = element.getAttribute('src')!
  const restrictedAudioId = getNumericAttribute(element, 'restricted-audio-id')
  const times = getNumericAttribute(element, 'times')
  const duration = getNumericAttribute(element, 'duration')!
  const { t } = useExamTranslation()
  const audioPlaybackError =
    times != null && restrictedAudioId != null ? useSelector(getAudioPlaybackError(src, restrictedAudioId)) : undefined
  const playbackTimesRemaining =
    times != null && restrictedAudioId != null
      ? useSelector(getPlaybackTimesRemaining(restrictedAudioId, times))
      : undefined
  const { resolveAttachment } = useContext(CommonExamContext)
  const labelId = audioLabelId(element)

  return (
    <div className={classNames('audio e-columns e-columns--center-v e-mrg-b-2', className)}>
      {restrictedAudioId != null && times != null ? (
        <RestrictedAudioPlayer {...{ src, restrictedAudioId, duration, times, labelId }} />
      ) : (
        <audio className="e-column e-column--narrow" preload="metadata" controls>
          <source src={resolveAttachment(src)} />
        </audio>
      )}
      <div className="e-column" id={labelId}>
        <AudioPlaybackError error={audioPlaybackError}>
          {element.hasChildNodes() && renderChildNodes(element)}
        </AudioPlaybackError>
        {playbackTimesRemaining != null && <em>{t('listen-times-remaining', { count: playbackTimesRemaining })}</em>}
      </div>
    </div>
  )
}

export default React.memo(Audio)
