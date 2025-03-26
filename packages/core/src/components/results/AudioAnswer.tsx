import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute } from '../../dom-utils'
import { ResultsContext } from '../context/ResultsContext'
import { TextAnswer } from '../../types/ExamAnswer'

function AudioAnswer(audioAnswerProps: ExamComponentProps) {
  const { element } = audioAnswerProps
  const { answersByQuestionId } = useContext(ResultsContext)
  const questionId = getNumericAttribute(element, 'question-id')!
  const answer = answersByQuestionId[questionId] as TextAnswer | undefined
  const value = answer && answer.value

  return value ? (
    <audio src={value} className="e-column e-column--narrow" preload="metadata" controls controlsList="nodownload" />
  ) : null
}

export default React.memo(AudioAnswer)
