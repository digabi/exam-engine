import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute } from '../../dom-utils'
import { saveAnswer } from '../../store/answers/actions'
import { useDispatch, useSelector } from 'react-redux'
import { ExamContext } from '../context/ExamContext'
import { AnswersState } from '../../store/answers/reducer'
import type { AudioAnswer } from '../../types/ExamAnswer'
import { AudioRecorder } from './internal/AudioRecorder'

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
    <div className="audio-answer" data-testid="audio-answer">
      <span className="anchor" id={`question-nr-${displayNumber}`} />
      <AudioRecorder
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
        audioRecorderOptions={{
          audioBitsPerSecond: 65536,
          saveIntervalMs: 5000
        }}
      />
    </div>
  )
}

export default React.memo(AudioAnswer)
