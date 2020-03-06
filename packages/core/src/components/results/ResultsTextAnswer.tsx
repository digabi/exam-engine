import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { getNumericAttribute } from '../../dom-utils'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import AnswerToolbar from '../AnswerToolbar'
import { QuestionContext } from '../QuestionContext'
import { ExamComponentProps, TextAnswer } from '../types'
import { findScore, ResultsContext } from './ResultsContext'
import ResultsExamQuestionScore from './ResultsExamQuestionScore'

function ResultsTextAnswer({ element }: ExamComponentProps) {
  const { answers } = useContext(QuestionContext)
  const { answersByQuestionId, scores } = useContext(ResultsContext)
  const { t } = useTranslation()
  const questionId = getNumericAttribute(element, 'question-id')!
  const maxScore = getNumericAttribute(element, 'max-score')!
  const answer = answersByQuestionId[questionId] as TextAnswer | undefined
  const value = answer && answer.value
  const displayNumber = shortDisplayNumber(element.getAttribute('display-number')!)
  const score = findScore(scores, questionId)
  const comment = score?.comment
  const type = (element.getAttribute('type') || 'single-line') as 'rich-text' | 'multi-line' | 'single-line'

  switch (type) {
    case 'rich-text':
    case 'multi-line': {
      return (
        <>
          {score && <ResultsExamQuestionScore score={score.scoreValue} maxScore={maxScore} />}
          <div className="answer-text e-multiline-results-text-answer">
            <div className="answer-text-container">
              <div className="answerText" dangerouslySetInnerHTML={{ __html: value! }} />
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
              <span className="answerText">{value}</span>
            </span>
          </span>
          {score && (
            <ResultsExamQuestionScore
              score={score.scoreValue}
              maxScore={maxScore}
              displayNumber={answers.length > 1 ? displayNumber : undefined}
            />
          )}
        </>
      )
  }
}
export default React.memo(ResultsTextAnswer)
