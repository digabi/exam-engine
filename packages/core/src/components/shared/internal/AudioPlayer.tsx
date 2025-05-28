import { faPause, faPlay, faVolumeHigh } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { formatDuration } from './RestrictedAudioPlayer'
import { useExamTranslation } from '../../../i18n'

interface AudioPlayerProps {
  src: string
  variant?: 'recorded' | 'repeatable'
  labelId?: string
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, variant = 'repeatable', labelId }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLInputElement>(null)
  const { t } = useExamTranslation()

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onDurationChange = () => {
      setDuration(audio.duration)
      onTimeUpdate()
    }

    const onTime = () => onTimeUpdate()
    const setPlayingFalse = () => setIsPlaying(false)
    const setPlayingTrue = () => setIsPlaying(true)

    audio.addEventListener('loadeddata', onDurationChange)
    audio.addEventListener('loadedmetadata', onDurationChange)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('playing', setPlayingTrue)
    audio.addEventListener('pause', setPlayingFalse)
    audio.addEventListener('ended', setPlayingFalse)
    return () => {
      audio.removeEventListener('loadeddata', onDurationChange)
      audio.removeEventListener('loadedmetadata', onDurationChange)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('playing', setPlayingTrue)
      audio.removeEventListener('pause', setPlayingFalse)
      audio.removeEventListener('ended', setPlayingFalse)
    }
  }, [src])

  useEffect(() => {
    if (isPlaying) void audioRef.current?.play()
    else audioRef.current?.pause()
  }, [isPlaying])

  const togglePlay = () => setIsPlaying(prev => !prev)

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = +e.target.value
    onTimeUpdate(t)
  }

  const onTimeUpdate = useCallback(
    (seekTime?: number) => {
      if (!audioRef.current) return
      if (seekTime) audioRef.current.currentTime = seekTime
      const newTime = audioRef.current.currentTime
      // for some reason duration is 0 here, so we use the audioRef
      const dur = audioRef.current.duration
      setCurrentTime(newTime)
      if (progressBarRef.current) {
        progressBarRef.current.style.setProperty('--range-progress', `${(newTime / dur) * 100}%`)
      }
    },
    [duration, audioRef, progressBarRef]
  )

  return (
    <div
      className={`custom-audio-player custom-audio-player--${variant} e-column e-column--narrow`}
      aria-describedby={labelId}
      data-testid="audio-player-container"
    >
      <audio ref={audioRef} src={src} preload="metadata" aria-hidden="true" />

      <button
        className={`play-button`}
        onClick={togglePlay}
        data-testid="audio-player-play-pause-button"
        aria-label={isPlaying ? t.raw('audio-player.aria.pause') : t.raw('audio-player.aria.play')}
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="icon" />
      </button>

      <span className={`time`} data-testid="audio-player-current-time" aria-hidden="true">
        {formatDuration(currentTime)}
      </span>

      <input
        ref={progressBarRef}
        type="range"
        min={0}
        max={duration}
        step={0.01}
        value={currentTime}
        onChange={onSeek}
        aria-label={t.raw('audio-player.aria.seek-slider-aria-label')}
        aria-valuetext={`${formatDuration(currentTime)}/${formatDuration(duration)}`}
        data-testid="audio-player-progress-bar"
      />
      <span className={`time`} data-testid="audio-player-duration" aria-hidden="true">
        {formatDuration(duration)}
      </span>

      <FontAwesomeIcon icon={faVolumeHigh} className={`audio-icon`} aria-hidden="true" />
    </div>
  )
}

export default AudioPlayer
