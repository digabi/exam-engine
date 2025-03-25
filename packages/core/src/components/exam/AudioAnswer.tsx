import React, { useContext, useState } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute } from '../../dom-utils'
import { saveAnswer } from '../../store/answers/actions'
import { useDispatch, useSelector } from 'react-redux'
import { ReactMediaRecorder } from 'react-media-recorder'
import { ExamContext } from '../context/ExamContext'
import { AnswersState } from '../../store/answers/reducer'
import type { AudioAnswer } from '../../types/ExamAnswer'

interface AudioAnswerRecorderProps {
  audioUrl?: string
  onSave: (blob: Blob) => void
  onDelete: () => void
  bitsPerSecond?: number
}

function AudioAnswerRecorder({ onSave, onDelete, bitsPerSecond, audioUrl }: AudioAnswerRecorderProps) {
  const [blobSize, setBlobSize] = useState<number>(0)

  return (
    <ReactMediaRecorder
      audio={true}
      mediaRecorderOptions={{ audioBitsPerSecond: bitsPerSecond ?? 65536 }}
      onStop={(_blobUrl, blob) => onSave(blob)}
      render={({ status, error, startRecording, stopRecording }) => (
        <>
          <div>
            <p>status: {status}</p>
            {error && <p>error: {error}</p>}
            {blobSize > 0 && <p>size: {blobSize} bytes</p>}
            {audioUrl && <p>audiourl: {audioUrl}</p>}
            <p>
              <button onClick={startRecording} disabled={status == 'recording' || !!audioUrl}>
                Tallenna ääntä
              </button>
              <button onClick={stopRecording} disabled={status != 'recording'}>
                Lopeta tallennus
              </button>
              <button
                onClick={() => {
                  setBlobSize(0)
                  onDelete()
                }}
                disabled={!audioUrl}
              >
                Poista äänite
              </button>
            </p>
          </div>
          {audioUrl && (
            <audio
              src={audioUrl}
              className="e-column e-column--narrow"
              preload="metadata"
              controls
              controlsList="nodownload"
            />
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
    <>
      <span className="anchor" id={`question-nr-${displayNumber}`} />
      <AudioAnswerRecorder
        audioUrl={answer?.value === '' ? undefined : answer?.value}
        onSave={async audio => {
          const audioAttachmentUrl = await examServerApi.saveAudio(questionId, audio)
          const answer = { questionId, type: 'audio' as const, value: audioAttachmentUrl }
          dispatch(saveAnswer(answer))
        }}
        onDelete={async () => {
          await examServerApi.deleteAudio(questionId)
          const answer = { questionId, type: 'audio' as const, value: '' }
          dispatch(saveAnswer(answer))
        }}
      />
    </>
  )
}

export default React.memo(AudioAnswer)
