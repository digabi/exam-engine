import classNames from 'classnames'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { getNumericAttribute } from '../../dom-utils'
import { shortDisplayNumber } from '../../shortDisplayNumber'
import AnswerToolbar from '../AnswerToolbar'
import { QuestionContext } from '../QuestionContext'
import { ExamComponentProps, TextAnswer } from '../types'
import { getAnnotationAttributes } from './helpers'
import { findScore, ResultsContext } from './ResultsContext'
import ResultsExamQuestionManualScore from './ResultsExamQuestionManualScore'
import ResultsSingleLineAnswer from './ResultsSingleLineAnswer'

function ResultsTextAnswer({ element }: ExamComponentProps) {
  const { answers } = useContext(QuestionContext)
  const { answersByQuestionId, scores } = useContext(ResultsContext)
  const { t } = useTranslation()
  const questionId = getNumericAttribute(element, 'question-id')!
  const maxScore = getNumericAttribute(element, 'max-score')!
  const answer = answersByQuestionId[questionId] as TextAnswer | undefined
  const value = answer && answer.value
  const displayNumber = shortDisplayNumber(element.getAttribute('display-number')!)
  const answerScores = findScore(scores, questionId)
  const comment = answerScores?.pregrading?.comment
  const type = (element.getAttribute('type') || 'single-line') as 'rich-text' | 'multi-line' | 'single-line'

  switch (type) {
    case 'rich-text':
    case 'multi-line': {
      const props = {
        ...getAnnotationAttributes(answerScores),
        className: classNames('answerText', { 'e-pre-wrap': type === 'multi-line' }),
      }
      return (
        <>
          <ResultsExamQuestionManualScore scores={answerScores} maxScore={maxScore} />
          <div className="answer e-multiline-results-text-answer">
            <div className="answer-text-container">
              {type === 'rich-text' ? (
                <div {...props} dangerouslySetInnerHTML={{ __html: value! }} />
              ) : (
                <div {...props}>{value}</div>
              )}
            </div>
          </div>
          <AnswerToolbar
            {...{
              answer,
              element,
            }}
          />
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
        <ResultsSingleLineAnswer {...{ answers, answerScores, displayNumber, value }}>
          <ResultsExamQuestionManualScore
            {...{ scores: answerScores, maxScore, displayNumber: answers.length > 1 ? displayNumber : undefined }}
          />
        </ResultsSingleLineAnswer>
      )
  }
}

export default React.memo(ResultsTextAnswer)
