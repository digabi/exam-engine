import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute } from '../../dom-utils'
import { findScore, ResultsContext } from '../context/ResultsContext'
import { TextAnswer } from '../../types/ExamAnswer'
import ResultsExamQuestionManualScore from './internal/QuestionManualScore'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import { QuestionContext } from '../context/QuestionContext'
import { useExamTranslation } from '../../i18n'

function AudioAnswer(audioAnswerProps: ExamComponentProps) {
  const { element } = audioAnswerProps
  const { answers } = useContext(QuestionContext)
  const { t } = useExamTranslation()
  const { answersByQuestionId, scores } = useContext(ResultsContext)
  const questionId = getNumericAttribute(element, 'question-id')!
  const answer = answersByQuestionId[questionId] as TextAnswer | undefined
  const value = answer && answer.value
  const score = findScore(scores, questionId)
  const maxScore = getNumericAttribute(element, 'max-score')!
  const displayNumber = answers.length > 1 ? shortDisplayNumber(element.getAttribute('display-number')!) : undefined
  const comment = score?.pregrading?.comment

  return value ? (
    <>
      <audio src={value} className="e-column e-column--narrow" preload="metadata" controls controlsList="nodownload" />
      <ResultsExamQuestionManualScore {...{ scores: score, maxScore, displayNumber, questionId }} />
      {comment && (
        <>
          <h5>{t('comment')}</h5>
          <p className="e-italic">{comment}</p>
        </>
      )}
    </>
  ) : null
}

export default React.memo(AudioAnswer)
