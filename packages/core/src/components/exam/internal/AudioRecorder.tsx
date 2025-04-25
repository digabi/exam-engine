import React, { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMicrophone, faStop } from '@fortawesome/free-solid-svg-icons'
import { useExamTranslation } from '../../../i18n'

type AudioRecorderOptions = Omit<MediaRecorderOptions, 'bitsPerSecond' | 'videoBitsPerSecond'>

interface AudioRecorderProps {
  audioUrl?: string
  onSave: (blob: Blob) => void
  onDelete: () => void
  audioRecorderOptions?: AudioRecorderOptions
}

export function AudioRecorder({ audioUrl, onSave, onDelete, audioRecorderOptions }: AudioRecorderProps) {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder>()
  const [timeElapsed, setTimeElapsed] = useState<number>(0)
  const [status, setStatus] = useState<RecordingState>('inactive')
  const [error, setError] = useState<Error | null>(null)
  const timer = useRef<{ id: NodeJS.Timeout; startTime: Date }>()
  const { t } = useExamTranslation()

  useEffect(() => {
    void (async function () {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          //const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } })
          setMediaRecorder(new MediaRecorder(mediaStream, audioRecorderOptions))
        } else {
          showError(new Error('Cannot get media stream, possibly insecure context'))
        }
      } catch (err) {
        showError(err)
      }
      return () => stopRecording() // this never happens while recording
    })()
  }, [])

  function startRecording() {
    try {
      setError(null)
      if (mediaRecorder) {
        startTimer()
        mediaRecorder.start()
        setStatus(mediaRecorder.state)
        //mediaRecorder.start(1000) // to save in chunks
        mediaRecorder.ondataavailable = onData
        mediaRecorder.onerror = (ev: ErrorEvent) => showError(new Error(ev.message))
      }
    } catch (err) {
      showError(err)
    }
  }

  function stopRecording() {
    setError(null)
    try {
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
    setError(err instanceof Error ? err : new Error('unknown error'))
  }

  function deleteRecording() {
    setError(null)
    onDelete()
  }

  return (
    <>
      <div>
        <p>
          {status != 'recording' && !audioUrl && (
            <button className="e-button start-recording" onClick={() => void startRecording()} disabled={error != null}>
              <FontAwesomeIcon size="sm" icon={faMicrophone} fixedWidth />
              {t('start.recording')}
            </button>
          )}
          <>
            {status == 'recording' && (
              <>
                <button className="e-button stop-recording" onClick={stopRecording} disabled={error != null}>
                  <FontAwesomeIcon size="sm" icon={faStop} fixedWidth />
                  {t('stop.recording')}
                </button>
                <span className="time-elapsed">{renderTimeElapsed()}</span>
              </>
            )}
          </>
        </p>
      </div>
      {audioUrl && (
        <div className="audio-answer-controls">
          <audio
            src={audioUrl}
            className="e-column e-column--narrow"
            preload="metadata"
            controls
            controlsList="nodownload"
          />
          <button className="e-button-secondary delete-recording" onClick={deleteRecording}>
            {t('remove.recording')}
          </button>
        </div>
      )}
      {error && <div>{error.message}</div>}
    </>
  )
}
