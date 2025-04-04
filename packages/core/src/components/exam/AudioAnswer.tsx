import React, { useContext, useRef, useState } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute } from '../../dom-utils'
import { saveAnswer } from '../../store/answers/actions'
import { useDispatch, useSelector } from 'react-redux'
import { ReactMediaRecorder } from 'react-media-recorder'
import { ExamContext } from '../context/ExamContext'
import { AnswersState } from '../../store/answers/reducer'
import type { AudioAnswer } from '../../types/ExamAnswer'
import { useExamTranslation } from '../../i18n'
import { faMicrophone, faStop } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface AudioAnswerRecorderProps {
  audioUrl?: string
  onSave: (blob: Blob) => void
  onDelete: () => void
  bitsPerSecond?: number
}

function AudioAnswerRecorder({ onSave, onDelete, bitsPerSecond, audioUrl }: AudioAnswerRecorderProps) {
  const { t } = useExamTranslation()
  const timer = useRef<{ id: NodeJS.Timeout; startTime: Date }>()
  const [timeElapsed, setTimeElapsed] = useState<number>(0)

  function startTimer() {
    const timerId = setInterval(() => {
      const timeElapsedMs = new Date().getTime() - (timer?.current?.startTime ?? new Date()).getTime()
      setTimeElapsed(Math.floor(timeElapsedMs / 1000))
    }, 1000)
    timer.current = { id: timerId, startTime: new Date() }
  }

  function saveAndStopTimer(blob: Blob) {
    clearInterval(timer.current?.id)
    setTimeElapsed(0)
    onSave(blob)
  }

  function renderTimeElapsed() {
    const minutes = Math.floor(timeElapsed / 60)
    const sec = timeElapsed - minutes * 60
    const seconds = `00${sec}`.slice(-2)
    return `${minutes}:${seconds}`
  }

  return (
    <ReactMediaRecorder
      audio={true}
      mediaRecorderOptions={{ audioBitsPerSecond: bitsPerSecond ?? 65536 }}
      blobPropertyBag={{ type: 'audio/mpeg' }}
      onStart={startTimer}
      onStop={(_blobUrl, blob) => saveAndStopTimer(blob)}
      render={({ status, error, startRecording, stopRecording }) => (
        <>
          <div>
            {error && <p>error: {error}</p>}
            <p>
              {status != 'recording' && !audioUrl && (
                <button className="e-button" onClick={startRecording}>
                  <FontAwesomeIcon size="sm" icon={faMicrophone} fixedWidth />
                  {t('start.recording')}
                </button>
              )}
              {status == 'recording' && (
                <>
                  <button className="e-button" onClick={stopRecording}>
                    <FontAwesomeIcon size="sm" icon={faStop} fixedWidth />
                    {t('stop.recording')}
                  </button>
                  <span className="time-elapsed">{renderTimeElapsed()}</span>
                </>
              )}
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
              <button className="e-button-secondary delete-recording" onClick={onDelete}>
                {t('remove.recording')}
              </button>
            </div>
          )}
        </>
      )}
    />
  )
}

function AudioAnswer(audioAnswerProps: ExamComponentProps) {
  const { element } = audioAnswerProps

  const questionId = getNumericAttribute(element, 'question-id')!
  const answer = useSelector(
    (state: { answers: AnswersState }) => state.answers.answersById[questionId] as AudioAnswer | undefined
  )
  const displayNumber = element.getAttribute('display-number')!
  const dispatch = useDispatch()
  const { examServerApi } = useContext(ExamContext)

  return (
    <div className="audio-answer">
      <span className="anchor" id={`question-nr-${displayNumber}`} />
      <AudioAnswerRecorder
        audioUrl={answer?.value === '' ? undefined : answer?.value}
        onSave={audio => {
          void (async function () {
            const audioAttachmentUrl = await examServerApi.saveAudio(questionId, audio)
            const answer = { questionId, type: 'audio' as const, value: audioAttachmentUrl }
            dispatch(saveAnswer(answer))
          })()
        }}
        onDelete={() => {
          if (!answer) return
          void (async function () {
            const audioId = answer.value.split('/').pop()!
            await examServerApi.deleteAudio(audioId)
            const answerObj = { questionId, type: 'audio' as const, value: '' }
            dispatch(saveAnswer(answerObj))
          })()
        }}
      />
    </div>
  )
}

export default React.memo(AudioAnswer)
