import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import classNames from 'classnames'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { playAudio } from '../store/audio/actions'
import { getAudioState, getDurationRemaining, getPlaybackTimesRemaining } from '../store/selectors'
import { RestrictedAudioId } from '../types/ExamServerAPI'

function RestrictedAudioPlayer({
  src,
  restrictedAudioId,
  duration,
  times,
}: {
  src: string
  restrictedAudioId: RestrictedAudioId
  duration: number
  times: number
}) {
  const audioState = useSelector(getAudioState(src, restrictedAudioId))
  const durationRemaining = useSelector(getDurationRemaining(src, restrictedAudioId))
  const playbackTimesRemaining = useSelector(getPlaybackTimesRemaining(restrictedAudioId, times))
  const dispatch = useDispatch()
  const disabled = audioState !== 'stopped' || playbackTimesRemaining === 0

  return (
    <div
      className={classNames(
        'restricted-audio-player e-column e-column--narrow e-columns e-columns--inline e-columns--center-v e-pad-1',
        { 'restricted-audio-player--disabled': disabled }
      )}
    >
      <button
        className={classNames('restricted-audio-player__play e-column e-column--narrow', {
          'restricted-audio-player__play--playing': audioState === 'playing',
        })}
        disabled={disabled}
        onClick={() => audioState === 'stopped' && dispatch(playAudio({ src, restrictedAudioId, duration }))}
      >
        {audioState !== 'playing' && <FontAwesomeIcon icon={faPlay} fixedWidth aria-label="..." />}
      </button>
      <span className="restricted-audio-player__duration e-column e-text-right">
        {formatDuration(durationRemaining != null ? durationRemaining : duration)}
      </span>
    </div>
  )
}

export default React.memo(RestrictedAudioPlayer)

function formatDuration(duration: number): string {
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60

  return padWithZeroes(minutes) + ':' + padWithZeroes(seconds)
}

function padWithZeroes(num: number) {
  return num.toString().padStart(2, '0')
}
