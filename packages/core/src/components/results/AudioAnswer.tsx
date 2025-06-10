import React, { useContext } from 'react'
import { ExamComponentProps } from '../../createRenderChildNodes'
import { getNumericAttribute } from '../../dom-utils'
import { findScore, ResultsContext } from '../context/ResultsContext'
import { TextAnswer } from '../../types/ExamAnswer'
import ResultsExamQuestionManualScore from './internal/QuestionManualScore'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import { QuestionContext } from '../context/QuestionContext'
import { useExamTranslation } from '../../i18n'
import classNames from 'classnames'
import AudioPlayer from '../shared/internal/AudioPlayer'

function AudioAnswer(audioAnswerProps: ExamComponentProps) {
  const { element } = audioAnswerProps
  const { answers } = useContext(QuestionContext)
  const { t, i18n } = useExamTranslation()
  const { answersByQuestionId, scores } = useContext(ResultsContext)
  const questionId = getNumericAttribute(element, 'question-id')!
  const answer = answersByQuestionId[questionId] as TextAnswer | undefined
  const value = answer && answer.value
  const score = findScore(scores, questionId)
  const maxScore = getNumericAttribute(element, 'max-score')!
  const displayNumber = answers.length > 1 ? shortDisplayNumber(element.getAttribute('display-number')!) : undefined
  const comment = score?.pregrading?.comment

  return (
    <>
      <ResultsExamQuestionManualScore {...{ scores: score, maxScore, displayNumber, questionId }} />
      <div
        className={classNames('audio-answer', {
          'no-answer': !value
        })}
        aria-description={!value ? i18n.t('examineExam.questionHasNoAnswer') : undefined}
      >
        {value ? (
          <AudioPlayer src={value} variant="recorded" />
        ) : (
          <span className="e-normal"> {i18n.t('examineExam.questionHasNoAnswer')}</span>
        )}
      </div>
      {comment && (
        <>
          <h5>{t('comment')}</h5>
          <p className="e-italic">{comment}</p>
        </>
      )}
    </>
  )
}

export default React.memo(AudioAnswer)
