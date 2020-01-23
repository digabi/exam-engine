import classNames from 'classnames'
import _ from 'lodash-es'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { findChildrenAnswers, getNumericAttribute } from '../../dom-utils'
import { AppState } from '../../store/index'
import AnsweringInstructions from '../AnsweringInstructions'
import NotificationIcon from '../NotificationIcon'
import { QuestionContext } from '../QuestionContext'
import { ExamComponentProps } from '../types'
import { ExamResultsContext, findMultiChoice } from './ExamResultsContext'

function ExamQuestionTitleResult({ element, renderChildNodes}: ExamComponentProps) {
  const { displayNumber, maxScore, level, maxAnswers, childQuestions } = useContext(QuestionContext)
  const Tag = ('h' + Math.min(3 + level, 6)) as any
  const { t } = useTranslation()

  const answersById = useSelector((state: AppState) => state.answers.answersById)
  const { gradingStructure } = useContext(ExamResultsContext)
  const sumScore = _.sum(
    findChildrenAnswers(element.parentElement!).map(answer => {
      const questionId = getNumericAttribute(answer, 'question-id')!
      const scoredAnswer = answersById[questionId]
      if (!scoredAnswer) {
        return 0
      }
      if (scoredAnswer.type === 'choice') {
        const choice = findMultiChoice(gradingStructure, questionId)
        if (choice) {
          return choice.options.find((o: { id: number }) => o.id === Number(scoredAnswer.value)).score
        }
      } else {
        const text = gradingStructure.find((q: { id: number }) => q.id === questionId)
        if (text) {
          return text.scoreValue
        }
      }
      return 0
    })
  )

  return (
    <>
      <div className="e-float-right">
        {t('points', { count: maxScore })} max <br />
        <b>{t('points', { count: sumScore })}</b>
      </div>
      <Tag className={classNames('exam-question-title', { 'e-normal e-font-size-m': level > 0 })}>
        <strong
          className={classNames('exam-question-title__display-number', {
            'exam-question-title__display-number--indented': level > 0
          })}
        >
          {displayNumber}
          {'. '}
        </strong>
        {renderChildNodes(element)}
      </Tag>
      {maxAnswers != null && childQuestions.length > 0 && (
        <p className="e-italic">
          <NotificationIcon />
          <AnsweringInstructions maxAnswers={maxAnswers} childQuestions={childQuestions} type="question" />
        </p>
      )}
    </>
  )
}

export default React.memo(ExamQuestionTitleResult)
