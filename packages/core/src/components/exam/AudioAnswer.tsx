import React, { useState } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute } from '../../dom-utils'
import { saveAnswer } from '../../store/answers/actions'
import { useDispatch } from 'react-redux'
import { ReactMediaRecorder } from 'react-media-recorder'

interface AudioAnswerRecorderProps {
  onSave: (blobUrl: string, blob: Blob | null) => void
  bitsPerSecond?: number
}

function AudioAnswerRecorder({ onSave, bitsPerSecond }: AudioAnswerRecorderProps) {
  const [blobSize, setBlobSize] = useState<number>(0)

  return (
    <ReactMediaRecorder
      audio={true}
      mediaRecorderOptions={{ audioBitsPerSecond: bitsPerSecond ?? 65536 }}
      onStop={(blobUrl, blob) => onSave(blobUrl, blob)}
      render={({ status, error, startRecording, stopRecording, clearBlobUrl, mediaBlobUrl }) => (
        <>
          <div>
            <p>status: {status}</p>
            {error && <p>error: {error}</p>}
            {blobSize > 0 && <p>size: {blobSize} bytes</p>}
            <p>
              <button onClick={startRecording} disabled={status != 'idle'}>
                Tallenna ääntä
              </button>
              <button onClick={stopRecording} disabled={status != 'recording'}>
                Lopeta tallennus
              </button>
              <button
                onClick={() => {
                  clearBlobUrl()
                  setBlobSize(0)
                  onSave('', null)
                }}
                disabled={status != 'stopped' || !mediaBlobUrl}
              >
                Poista äänite
              </button>
            </p>
          </div>
          {mediaBlobUrl && (
            <audio
              src={mediaBlobUrl}
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
  const displayNumber = element.getAttribute('display-number')!
  const dispatch = useDispatch()

  return (
    <>
      <span className="anchor" id={`question-nr-${displayNumber}`} />
      <AudioAnswerRecorder
        onSave={(blobUrl: string, blob: Blob | null) => {
          console.info('save', blob)
          dispatch(saveAnswer({ type: 'audio', questionId, displayNumber, value: blobUrl }))
        }}
      />
    </>
  )
}

export default React.memo(AudioAnswer)
