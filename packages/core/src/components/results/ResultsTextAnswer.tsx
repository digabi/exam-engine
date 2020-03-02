import classNames from 'classnames'
import React, { useContext } from 'react'
import { Translation } from 'react-i18next'
import { getNumericAttribute } from '../../dom-utils'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import AnswerToolbar from '../AnswerToolbar'
import { ExamComponentProps, TextAnswer } from '../types'
import { findScore, ResultsContext } from './ResultsContext'
import ResultsExamQuestionScore from './ResultsExamQuestionScore'

function ResultsTextAnswer({ element, className }: ExamComponentProps) {
  const { answersByQuestionId } = useContext(ResultsContext)
  const questionId = getNumericAttribute(element, 'question-id')!
  const maxScore = getNumericAttribute(element, 'max-score')!
  const answer = answersByQuestionId[questionId] as TextAnswer | undefined
  const value = answer && answer.value
  const { scores } = useContext(ResultsContext)
  const displayNumber = shortDisplayNumber(element.getAttribute('display-number')!)
  const score = findScore(scores, questionId)
  const comment = score?.comment
  const type = (element.getAttribute('type') || 'single-line') as 'rich-text' | 'multi-line' | 'single-line'

  switch (type) {
    case 'rich-text':
    case 'multi-line': {
      return (
        <>
          {score && <ResultsExamQuestionScore className="e-float-right" score={score.scoreValue} maxScore={maxScore} />}

          <div className="answer">
            <div className="answer-text-container">
              <div
                className="answerText"
                data-annotations={JSON.stringify(score ? score.annotations : [])}
                dangerouslySetInnerHTML={{ __html: value! }}
              />
            </div>
            <AnswerToolbar
              {...{
                answer,
                element
              }}
            />
            <div className="answer-annotations">
              <div className="is_pregrading">
                <table className="annotation-messages" />
              </div>
            </div>
          </div>
          {comment && (
            <>
              <h5>
                <Translation>{t => t('comment')}</Translation>
              </h5>
              <div className="comment">{comment}</div>
            </>
          )}
        </>
      )
    }
    case 'single-line':
    default:
      return (
        <>
          <sup>{displayNumber}</sup>
          <span className={classNames('text-answer text-answer--single-line', className)}>{value}</span>
          {score && (
            <ResultsExamQuestionScore
              className="e-float-right"
              score={score.scoreValue}
              maxScore={maxScore}
              displayNumber={displayNumber}
            />
          )}
        </>
      )
  }
}
export default React.memo(ResultsTextAnswer)
