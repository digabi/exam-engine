import React, { useContext, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle, faMicrophone, faStop } from '@fortawesome/free-solid-svg-icons'
import { useExamTranslation } from '../../../i18n'
import AudioError from '../../shared/internal/AudioError'
import { AudioError as AudioErrorType } from '../../../types/ExamServerAPI'
import { NBSP } from '../../../dom-utils'
import AudioPlayer from '../../shared/internal/AudioPlayer'
import { AudioRecorderContext } from '../../context/AudioRecorderContext'

const spinner = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
  <g transform="scale(0.75)">
    <path fill="#204D99" d="M25,5A20.14,20.14,0,0,1,45,22.88a2.51,2.51,0,0,0,2.49,2.26h0A2.52,2.52,0,0,0,50,22.33a25.14,25.14,0,0,0-50,0,2.52,2.52,0,0,0,2.5,2.81h0A2.51,2.51,0,0,0,5,22.88,20.14,20.14,0,0,1,25,5Z">
      <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.5s" repeatCount="indefinite"/>
    </path>
  </g>
</svg>`)}`

type AudioRecorderOptions = Omit<MediaRecorderOptions, 'bitsPerSecond' | 'videoBitsPerSecond'> & {
  saveIntervalMs?: number
}

interface AudioRecorderProps {
  audioUrl?: string
  saveIntervalMs?: number
  onSave: (blob: Blob) => Promise<void>
  onDelete: () => Promise<void>
  audioRecorderOptions?: AudioRecorderOptions
}

const getSupportedAudioMediaType = (): string => {
  const mimeTypes = [
    // Can be recorded in Firefox. Playable in Chromium, Firefox and Safari
    'audio/ogg;codecs=opus',
    // Can be recorded in Chromium and Safari. Playable in Chromium, Firefox and Safari
    // If recorded in Firefox, firefox can't parse duration correctly, thus default to ogg
    'audio/webm;codecs=opus'
  ]

  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType
    }
  }
  return ''
}

export function AudioRecorder({ audioUrl, onSave, onDelete, audioRecorderOptions }: AudioRecorderProps) {
  const [timeElapsed, setTimeElapsed] = useState<number>(0)
  const [status, setStatus] = useState<RecordingState>('inactive')
  const [error, setError] = useState<AudioErrorType | null>(null)
  const [savingAudio, setSavingAudio] = React.useState(false)
  const mediaRecorder = useRef<MediaRecorder>()
  const timer = useRef<{ id: NodeJS.Timeout; startTime: Date }>()
  const { alreadyRecordingState } = useContext(AudioRecorderContext)
  const [alreadyRecording, setAlreadyRecording] = alreadyRecordingState

  const { t } = useExamTranslation()

  useEffect(
    () => () => {
      void stopRecording() // force stop unless user didn't do it
    },
    []
  )

  async function getMediaRecorder() {
    try {
      if (mediaRecorder.current) {
        return mediaRecorder.current
      }
      if (navigator.mediaDevices?.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const newMediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: getSupportedAudioMediaType(),
          ...audioRecorderOptions
        })
        newMediaRecorder.ondataavailable = onData
        newMediaRecorder.onerror = (ev: ErrorEvent) => showError(new Error(ev.message))
        mediaRecorder.current = newMediaRecorder
        return mediaRecorder.current
      } else {
        setError('permission-denied') // Cannot get media stream, possibly insecure context
      }
    } catch (err) {
      showError(err)
    }
  }

  async function startRecording() {
    try {
      setError(null)
      const mediaRecorder = await getMediaRecorder()
      if (mediaRecorder) {
        startTimer()
        mediaRecorder.start(audioRecorderOptions?.saveIntervalMs)
        setStatus(mediaRecorder.state)
        setAlreadyRecording(true)
      }
    } catch (err) {
      showError(err)
    }
  }

  async function stopRecording() {
    try {
      setAlreadyRecording(false)
      setError(null)
      const mediaRecorder = await getMediaRecorder()
      if (mediaRecorder) {
        stopTimer()
        mediaRecorder.stop()
        setStatus(mediaRecorder.state)
        setSavingAudio(true)
      }
    } catch (err) {
      showError(err)
    }
  }

  async function onData(blobEvent: BlobEvent) {
    await onSave(blobEvent.data)
    setSavingAudio(false)
  }

  function startTimer() {
    setTimeElapsed(0)
    const timerId = setInterval(() => {
      const timeElapsedMs = new Date().getTime() - (timer?.current?.startTime ?? new Date()).getTime()
      setTimeElapsed(Math.floor(timeElapsedMs / 1000))
    }, 1000)
    timer.current = { id: timerId, startTime: new Date() }
  }

  function stopTimer() {
    clearInterval(timer.current?.id)
  }

  function renderTimeElapsed() {
    const minutes = Math.floor(timeElapsed / 60)
    const sec = timeElapsed - minutes * 60
    const seconds = `00${sec}`.slice(-2)
    return `${minutes}:${seconds}`
  }

  function showError(err: unknown) {
    stopTimer()
    const error = err instanceof Error ? err : new Error('unknown error')
    switch (error.name) {
      case 'NotAllowedError':
        return setError('permission-denied')
      default:
        console.error(error.name, error.message)
        return setError('other-recording-error')
    }
  }

  function deleteRecording() {
    setError(null)
    void onDelete()
  }

  const audioComponentByStatus = () => {
    if (status == 'recording') {
      return (
        <>
          <button className="e-button stop-recording" onClick={() => void stopRecording()} disabled={error != null}>
            <FontAwesomeIcon size="lg" icon={faStop} fixedWidth />
            {NBSP}
            {NBSP}
            {t('recorder.stop')}
          </button>
          <span className="time-elapsed" data-testid="audio-answer-time-elapsed">
            {renderTimeElapsed()}
          </span>
        </>
      )
    }
    if (savingAudio) {
      return <img src={spinner} alt="..." />
    }
    if (audioUrl) {
      return (
        <div className="audio-answer-controls">
          <AudioPlayer src={audioUrl} variant={'recorded'} />
          <button className="e-button-secondary delete-recording" onClick={deleteRecording}>
            {t('recorder.delete')}
          </button>
        </div>
      )
    }
    return (
      <button
        className="e-button start-recording"
        onClick={() => void startRecording()}
        disabled={error != null || alreadyRecording}
      >
        <FontAwesomeIcon size="lg" icon={faMicrophone} fixedWidth />
        {NBSP}
        {NBSP}
        {t('recorder.start')}
      </button>
    )
  }

  const errorByStatusOrEmpty = () => {
    if (error) {
      return <AudioError error={error}>{NBSP}</AudioError>
    }
    if (alreadyRecording && status != 'recording' && !savingAudio && !audioUrl) {
      return (
        <p>
          <FontAwesomeIcon icon={faInfoCircle} />
          {NBSP}
          <span>{t('recorder.already-recording')}</span>
        </p>
      )
    }
    return NBSP
  }

  return (
    <div>
      {audioComponentByStatus()}
      {errorByStatusOrEmpty()}
    </div>
  )
}
