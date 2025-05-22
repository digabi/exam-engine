import React, { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophone, faStop } from '@fortawesome/free-solid-svg-icons'
import { useExamTranslation } from '../../../i18n'
import AudioError from '../../shared/internal/AudioError'
import { AudioError as AudioErrorType } from '../../../types/ExamServerAPI'
import { NBSP } from '../../../dom-utils'
import ModalDialog from '../../shared/internal/ModalDialog'

type AudioRecorderOptions = Omit<MediaRecorderOptions, 'bitsPerSecond' | 'videoBitsPerSecond'> & {
  saveIntervalMs?: number
}

interface AudioRecorderProps {
  audioUrl?: string
  saveIntervalMs?: number
  onSave: (blob: Blob) => void
  onDelete: () => void
  audioRecorderOptions?: AudioRecorderOptions
}

export function AudioRecorder({ audioUrl, onSave, onDelete, audioRecorderOptions }: AudioRecorderProps) {
  const [timeElapsed, setTimeElapsed] = useState<number>(0)
  const [status, setStatus] = useState<RecordingState>('inactive')
  const [error, setError] = useState<AudioErrorType | null>(null)
  const mediaRecorder = useRef<MediaRecorder>()
  const timer = useRef<{ id: NodeJS.Timeout; startTime: Date }>()
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
        mediaRecorder.current = new MediaRecorder(mediaStream, audioRecorderOptions)
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
      const activeRecordings = Array.from(document.querySelectorAll('[class="audio-recorder recording"]')).length
      if (activeRecordings > 0) {
        return setError('already-recording')
      }
      setError(null)
      const mediaRecorder = await getMediaRecorder()
      if (mediaRecorder) {
        startTimer()
        mediaRecorder.start(audioRecorderOptions?.saveIntervalMs)
        setStatus(mediaRecorder.state)
        mediaRecorder.ondataavailable = onData
        mediaRecorder.onerror = (ev: ErrorEvent) => showError(new Error(ev.message))
      }
    } catch (err) {
      showError(err)
    }
  }

  async function stopRecording() {
    try {
      setError(null)
      const mediaRecorder = await getMediaRecorder()
      if (mediaRecorder) {
        stopTimer()
        mediaRecorder.stop()
        setStatus(mediaRecorder.state)
      }
    } catch (err) {
      showError(err)
    }
  }

  function onData(blobEvent: BlobEvent) {
    onSave(blobEvent.data)
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
    onDelete()
  }

  return (
    <>
      <div className={`audio-recorder ${status}`}>
        <p>
          {status != 'recording' && !audioUrl && (
            <button className="e-button start-recording" onClick={() => void startRecording()} disabled={error != null}>
              <FontAwesomeIcon size="sm" icon={faMicrophone} fixedWidth />
              {t('audio-recorder.start')}
            </button>
          )}
          <>
            {status == 'recording' && (
              <>
                <button
                  className="e-button stop-recording"
                  onClick={() => void stopRecording()}
                  disabled={error != null}
                >
                  <FontAwesomeIcon size="sm" icon={faStop} fixedWidth />
                  {t('audio-recorder.stop')}
                </button>
                <span className="time-elapsed">{renderTimeElapsed()}</span>
              </>
            )}
          </>
        </p>
      </div>
      {audioUrl && status != 'recording' && (
        <div className="audio-answer-controls">
          <audio
            src={audioUrl}
            className="e-column e-column--narrow"
            preload="metadata"
            controls
            controlsList="nodownload"
          />
          <button className="e-button-secondary delete-recording" onClick={deleteRecording}>
            {t('audio-recorder.remove')}
          </button>
        </div>
      )}

      {error ? (
        error == 'already-recording' ? (
          <ModalDialog className="already-recording-error" onClose={() => setError(null)}>
            <p>{t('audio-recorder.already-recording')}</p>
            <div className="buttons">
              <button className="e-button e-button-primary" onClick={() => setError(null)}>
                {t('audio-recorder.close')}
              </button>
            </div>
          </ModalDialog>
        ) : (
          <AudioError error={error}>{NBSP}</AudioError>
        )
      ) : null}
    </>
  )
}
