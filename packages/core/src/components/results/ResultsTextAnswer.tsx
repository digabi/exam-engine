import classNames from 'classnames'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { getNumericAttribute } from '../../dom-utils'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import AnswerToolbar from '../AnswerToolbar'
import { QuestionContext } from '../QuestionContext'
import { ExamComponentProps, TextAnswer } from '../types'
import { findPregradingScore, ResultsContext } from './ResultsContext'
import ResultsExamQuestionManualScore from './ResultsExamQuestionScore'

function ResultsTextAnswer({ element }: ExamComponentProps) {
  const { answers } = useContext(QuestionContext)
  const { answersByQuestionId, scores } = useContext(ResultsContext)
  const { t } = useTranslation()
  const questionId = getNumericAttribute(element, 'question-id')!
  const maxScore = getNumericAttribute(element, 'max-score')!
  const answer = answersByQuestionId[questionId] as TextAnswer | undefined
  const value = answer && answer.value
  const displayNumber = shortDisplayNumber(element.getAttribute('display-number')!)
  const givenScores = scores[questionId]
  const pregradingScore = findPregradingScore(scores, questionId)
  const comment = pregradingScore?.comment
  const type = (element.getAttribute('type') || 'single-line') as 'rich-text' | 'multi-line' | 'single-line'

  switch (type) {
    case 'rich-text':
    case 'multi-line': {
      return (
        <>
          {givenScores && <ResultsExamQuestionManualScore scores={givenScores} maxScore={maxScore} />}
          <div className="answer">
            <div className="e-multiline-results-text-answer answer-text-container">
              <div
                className={classNames('answerText', { 'e-pre-wrap': type === 'multi-line' })}
                data-annotations={JSON.stringify(pregradingScore ? pregradingScore.annotations : [])}
                dangerouslySetInnerHTML={{ __html: value! }}
              />
            </div>
            <AnswerToolbar
              {...{
                answer,
                element
              }}
            />
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
    case 'single-line':
    default:
      return (
        <>
          {answers.length > 1 && <sup>{displayNumber}</sup>}
          <span className="answer">
            <span className="text-answer text-answer--single-line answer-text-container">
              <div
                className="answerText e-inline"
                data-annotations={JSON.stringify(pregradingScore ? pregradingScore.annotations : [])}
              >
                {value}
              </div>
            </span>
          </span>
          {givenScores && (
            <ResultsExamQuestionManualScore
              scores={givenScores}
              maxScore={maxScore}
              displayNumber={answers.length > 1 ? displayNumber : undefined}
            />
          )}
        </>
      )
  }
}

export default React.memo(ResultsTextAnswer)
