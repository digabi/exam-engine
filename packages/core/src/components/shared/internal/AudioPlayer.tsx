import { faPause, faPlay, faVolumeHigh } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { formatDuration } from './RestrictedAudioPlayer'

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

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoaded = () => setDuration(audio.duration)
    const onTime = () => onTimeUpdate()
    const setPlayingFalse = () => setIsPlaying(false)
    const setPlayingTrue = () => setIsPlaying(true)

    audio.addEventListener('loadeddata', onLoaded)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('durationchange', onLoaded)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('playing', setPlayingTrue)
    audio.addEventListener('pause', setPlayingFalse)
    audio.addEventListener('ended', setPlayingFalse)
    return () => {
      audio.removeEventListener('loadeddata', onLoaded)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('durationchange', onLoaded)
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
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <button className={`play-button`} onClick={togglePlay}>
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="icon" />
      </button>

      <span className={`time`}>{formatDuration(currentTime)}</span>

      <input
        ref={progressBarRef}
        type="range"
        min={0}
        max={duration}
        step={0.01}
        value={currentTime}
        onChange={onSeek}
        aria-label={formatDuration(currentTime)}
      />
      <span className={`time`}>{formatDuration(duration)}</span>

      <FontAwesomeIcon icon={faVolumeHigh} className={`audio-icon`} />
    </div>
  )
}

export default AudioPlayer
